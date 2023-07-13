function compose(...fns) {
  return x => fns.reduceRight((y, f) => f(y), x);
}

function curry(fn) {
  return function curried(...args) {
    return args.length >= fn.length
      ? fn.apply(this, args)
      : (...nextArgs) => curried.apply(this, [...args, ...nextArgs]);
  }
}

function isObject(value) {
  return Object.prototype.toString.call(value).includes('Object');
}

function isEmpty(obj) {
  return !Object.keys(obj).length;
}

function isFunction(value) {
  return typeof value === 'function';
}

function hasOwnProperty(object, property) {
  return Object.prototype.hasOwnProperty.call(object, property);
}

function throwError(errorMessages, type) {
  throw new Error(errorMessages[type] || errorMessages.default);
}

// https://github.com/suren-atoyan/state-local
function createState(initial, handler = {}) {
  const errorMessages = {
    initialIsRequired: 'initial state is required',
    initialType: 'initial state should be an object',
    initialContent: 'initial state shouldn\'t be an empty object',
    handlerType: 'handler should be an object or a function',
    handlersType: 'all handlers should be a functions',
    selectorType: 'selector should be a function',
    changeType: 'provided value of changes should be an object',
    changeField: 'it seams you want to change a field in the state which is not specified in the "initial" state',
    default: 'an unknown error accured in `state-local` package',
  };

  const errorHandler = curry(throwError)(errorMessages);

  const validators = {
    changes: (initial, changes) => {
      if (!isObject(changes)) errorHandler('changeType');
      if (Object.keys(changes).some(field => !hasOwnProperty(initial, field))) errorHandler('changeField');

      return changes;
    },
    selector: (selector) => {
      if (!isFunction(selector)) errorHandler('selectorType');
    },
    handler: (handler) => {
      if (!(isFunction(handler) || isObject(handler))) errorHandler('handlerType');
      if (isObject(handler) && Object.values(handler).some(_handler => !isFunction(_handler))) errorHandler('handlersType');
    },
    initial: (initial) => {
      if (!initial) errorHandler('initialIsRequired');
      if (!isObject(initial)) errorHandler('initialType');
      if (isEmpty(initial)) errorHandler('initialContent');
    },
  };

  function extractChanges(state, causedChanges) {
    return isFunction(causedChanges)
      ? causedChanges(state.current)
      : causedChanges;
  }

  function updateState(state, changes) {
    state.current = { ...state.current, ...changes };
    return changes;
  }

  function didStateUpdate(state, handler, changes) {
    isFunction(handler)
      ? handler(state.current)
      : Object.keys(changes)
          .forEach(field => handler[field]?.(state.current[field]));

    return changes;
  }

  validators.initial(initial);
  validators.handler(handler);

  const state = { current: initial };

  const didUpdate = curry(didStateUpdate)(state, handler);
  const update = curry(updateState)(state);
  const validate = curry(validators.changes)(initial);
  const getChanges = curry(extractChanges)(state);

  function getState(selector = state => state) {
    validators.selector(selector);
    return selector(state.current);
  }

  function setState(causedChanges) {
    compose(
      didUpdate,
      update,
      validate,
      getChanges,
    )(causedChanges);
  }

  return [getState, setState];
}

function merge(dest, src, redefine) {
  if (!dest) {
    throw new TypeError('argument dest is required');
  }

  if (!src) {
    throw new TypeError('argument src is required');
  }

  if (redefine === undefined) {
    // Default to true
    redefine = true;
  }

  Object.getOwnPropertyNames(src).forEach((name) => {
    if (!redefine && hasOwnProperty.call(dest, name)) {
      // Skip desriptor
      return;
    }

    // Copy descriptor
    const descriptor = Object.getOwnPropertyDescriptor(src, name);
    Object.defineProperty(dest, name, descriptor);
  })

  return dest;
}

function deepMerge(target, source) {
  Object.keys(source).forEach(key => {
    if (source[key] instanceof Object) {
      if (target[key]) {
        Object.assign(source[key], merge(target[key], source[key]));
      }
    }
  });

  return { ...target, ...source };
}

function makeCancelable(promise) {
  const CANCELATION_MESSAGE = {
    type: 'cancelation',
    msg: 'operation is manually canceled',
  };

  let hasCanceled_ = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(val => hasCanceled_ ? reject(CANCELATION_MESSAGE) : resolve(val));
    promise.catch(reject);
  });

  return (wrappedPromise.cancel = () => (hasCanceled_ = true), wrappedPromise);
}

// https://github.com/suren-atoyan/monaco-loader
function createLoader() {
  const errorMessages = {
    configIsRequired: 'the configuration object is required',
    configType: 'the configuration object should be an object',
    default: 'an unknown error accured in `@monaco-editor/loader` package',

    deprecation: `Deprecation warning!
      You are using deprecated way of configuration.
      Instead of using
        monaco.config({ urls: { monacoBase: '...' } })
      use
        monaco.config({ paths: { vs: '...' } })
      For more please check the link https://github.com/suren-atoyan/monaco-loader#config
    `,
  };

  const errorHandler = curry(throwError)(errorMessages);

  /**
   * logs deprecation message
   */
  function informAboutDeprecation() {
    console.warn(errorMessages.deprecation);
  }

  const validators = {
    /**
     * validates the configuration object and informs about deprecation
     * @param {Object} config - the configuration object 
     * @return {Object} config - the validated configuration object
     */
    config: (config) => {
      if (!config) errorHandler('configIsRequired');
      if (!isObject(config)) errorHandler('configType');
      if (config.urls) {
        informAboutDeprecation();
        return { paths: { vs: config.urls.monacoBase } };
      }

      return config;
    },
  };

  const defaultConfig = {
    paths: {
      vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.34.1/min/vs',
    },
  };

  /** the local state of the module */
  const [getState, setState] = createState({
    config: defaultConfig,
    isInitialized: false,
    resolve: null,
    reject: null,
    monaco: null,
  });

  /**
   * set the loader configuration
   * @param {Object} config - the configuration object
   */
  function config(globalConfig) {
    const { monaco, ...config } = validators.config(globalConfig);

    setState(state => ({
      config: deepMerge(
        state.config,
        config,
      ),
      monaco,
    }));
  }

  /**
   * handles the initialization of the monaco-editor
   * @return {Promise} - returns an instance of monaco (with a cancelable promise)
   */
  function init() {
    const state = getState(({ monaco, isInitialized, resolve }) => ({ monaco, isInitialized, resolve }));

    if (!state.isInitialized) {
      setState({ isInitialized: true });

      if (state.monaco) {
        state.resolve(state.monaco);
        return makeCancelable(wrapperPromise);
      }

      if (window.monaco && window.monaco.editor) {
        storeMonacoInstance(window.monaco);
        state.resolve(window.monaco);
        return makeCancelable(wrapperPromise);
      }

      compose(
        injectScripts,
        getMonacoLoaderScript,
      )(configureLoader);
    }

    return makeCancelable(wrapperPromise);
  }

  /**
   * injects provided scripts into the document.body
   * @param {Object} script - an HTML script element
   * @return {Object} - the injected HTML script element
   */
  function injectScripts(script) {
    return document.body.appendChild(script);
  }

  /**
   * creates an HTML script element with/without provided src
   * @param {string} [src] - the source path of the script
   * @return {Object} - the created HTML script element
   */
  function createScript(src) {
    const script = document.createElement('script');
    return (src && (script.src = src), script);
  }

  /**
   * creates an HTML script element with the monaco loader src
   * @return {Object} - the created HTML script element
   */
  function getMonacoLoaderScript(configureLoader) {
    const state = getState(({ config, reject }) => ({ config, reject }));

    const loaderScript = createScript(`${state.config.paths.vs}/loader.js`);
    loaderScript.onload = () => configureLoader();

    loaderScript.onerror = state.reject;

    return loaderScript;
  }

  /**
   * configures the monaco loader
   */
  function configureLoader() {
    const state = getState(
      ({ config, resolve, reject }) => ({ config, resolve, reject })
    );

    const require = window.require;

    require.config(state.config);
    require(
      ['vs/editor/editor.main'],
      function(monaco) {
        storeMonacoInstance(monaco);
        state.resolve(monaco);
      },
      function(error) {
        state.reject(error);
      },
    );
  }

  /**
   * store monaco instance in local state
   */
  function storeMonacoInstance(monaco) {
    if (!getState().monaco) {
      setState({ monaco });
    }
  }

  /**
   * internal helper function
   * extracts stored monaco instance
   * @return {Object|null} - the monaco instance
   */
  function __getMonacoInstance() {
    return getState(({ monaco }) => monaco);
  }

  const wrapperPromise = new Promise((resolve, reject) => setState({ resolve, reject }));

  return { config, init, __getMonacoInstance };
}

export default createLoader();