import { watch, nextTick, readonly, ref, unref, shallowRef, getCurrentScope, onScopeDispose } from 'vue';

const defaultWindow = typeof window !== 'undefined' ? window : undefined;

const customStorageEventName = 'vueuse-storage';

/**
 * Get the value of value/ref/getter.
 */
function toValue(r) {
  return typeof r === 'function' ? r() : unref(r);
}

/**
 * Get the dom element of a ref of element or Vue component instance
 *
 * @param elRef
 */
function unrefElement(elRef) {
  const plain = toValue(elRef);
  return plain?.$el ?? plain;
}

/**
 * @internal
 */
function createFilterWrapper(filter, fn) {
  return (that, ...args) => {
    return new Promise((resolve, reject) => {
      // make sure it's a promise
      Promise.resolve(filter(() => fn.apply(that, args), { fn, thisArg: that, args }))
        .then(resolve)
        .catch(reject);
    });
  }
}

const bypassFilter = (invoke) => {
  return invoke();
};

/**
 * EventFilter that gives extra controls to pause and resume the filter
 *
 * @param extendFilter  Extra filter to apply when the PausableFilter is active, default to none
 *
 */
function pausableFilter(extendFilter = bypassFilter) {
  const isActive = ref(true);

  function pause() {
    isActive.value = false;
  }
  function resume() {
    isActive.value = true;
  }

  const eventFilter = (...args) => {
    if (isActive.value) {
      extendFilter(...args);
    }
  };

  return { isActive: readonly(isActive), pause, resume, eventFilter };
}

function watchWithFilter(source, cb, options = {}) {
  const {
    eventFilter = bypassFilter,
    ...watchOptions
  } = options;

  return watch(
    source,
    createFilterWrapper(
      eventFilter,
      cb,
    ),
    watchOptions,
  );
}

function pausableWatch(source, cb, options = {}) {
  const {
    eventFilter: filter,
    ...watchOptions
  } = options;

  const { eventFilter, pause, resume, isActive } = pausableFilter(filter);
  const stop = watchWithFilter(
    source,
    cb,
    {
      ...watchOptions,
      eventFilter,
    },
  );

  return { stop, pause, resume, isActive };
}

function getSSRHandler(key, fallback) {
  const _global = typeof globalThis !== 'undefined' ? globalThis
      : typeof window !== 'undefined' ? window
      : typeof global !== 'undefined' ? global
      : typeof self !== 'undefined' ? self
      : {};

  if (typeof _global[key] === 'function') {
    return _global[key];
  }           
  return fallback;
}

const StorageSerializers = {
  boolean: {
    read: (v) => v === 'true',
    write: (v) => String(v),
  },
  object: {
    read: (v) => JSON.parse(v),
    write: (v) => JSON.stringify(v),
  },
  number: {
    read: (v) => Number.parseFloat(v),
    write: (v) => String(v),
  },
  any: {
    read: (v) => v,
    write: (v) => String(v),
  },
  string: {
    read: (v) => v,
    write: (v) => String(v),
  },
  map: {
    read: (v) => new Map(JSON.parse(v)),
    write: (v) => JSON.stringify(Array.from(v.entries())),
  },
  set: {
    read: (v) => new Set(JSON.parse(v)),
    write: (v) => JSON.stringify(Array.from(v)),
  },
  date: {
    read: (v) => new Date(v),
    write: (v) => v.toISOString(),
  },
};

function guessSerializerType(rawInit) {
  return rawInit == null
    ? 'any'
    : rawInit instanceof Set
      ? 'set'
      : rawInit instanceof Map
        ? 'map'
        : rawInit instanceof Date
          ? 'date'
          : typeof rawInit === 'boolean'
            ? 'boolean'
            : typeof rawInit === 'string'
              ? 'string'
              : typeof rawInit === 'object'
                ? 'object'
                : !Number.isNaN(rawInit)
                    ? 'number'
                    : 'any'
}

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 5: Custom event target fallback
 *
 * @see https://vueuse.org/useEventListener
 * @param target
 * @param events
 * @param listeners
 * @param options
 */
export function useEventListener(target, events, listeners, options) {
  if (typeof target === 'string') {
    options = listeners;
    listeners = events;
    events = target;
    target = defaultWindow;
  }

  if (!target) return (() => {});

  if (!Array.isArray(events)) {
    events = [events];
  }
  if (!Array.isArray(listeners)) {
    listeners = [listeners];
  }

  const cleanups = [];
  const cleanup = () => {
    cleanups.forEach(fn => fn());
    cleanups.length = 0;
  };

  const register = (el, event, listener, options) => {
    el.addEventListener(event, listener, options);
    return () => el.removeEventListener(event, listener, options);
  };

  const stopWatch = watch(
    () => [unrefElement(target), toValue(options)],
    ([el, options]) => {
      cleanup();
      if (!el) return;

      cleanups.push(
        ...events.flatMap((event) => {
          return listeners.map(listener => register(el, event, listener, options));
        }),
      );
    },
    { immediate: true, flush: 'post' },
  );

  const stop = () => {
    stopWatch();
    cleanup();
  };

  if (getCurrentScope()) {
    onScopeDispose(stop);
  }

  return stop;
}

/**
 * Reactive LocalStorage/SessionStorage.
 *
 * @see https://vueuse.org/useStorage
 */
export function useStorage(key, defaults, storage, options = {}) {
  const {
    flush = 'pre',
    deep = true,
    listenToStorageChanges = true,
    writeDefaults = true,
    mergeDefaults = false,
    shallow,
    window = defaultWindow,
    eventFilter,
    onError = (e) => {
      console.error(e);
    },
  } = options;

  const data = (shallow ? shallowRef : ref)(defaults);

  if (!storage) {
    try {
      storage = getSSRHandler('getDefaultStorage', () => defaultWindow?.localStorage)();
    } catch (e) {
      onError(e);
    }
  }

  if (!storage) return data;

  const rawInit = toValue(defaults);
  const type = guessSerializerType(rawInit);
  const serializer = options.serializer ?? StorageSerializers[type];

  const { pause: pauseWatch, resume: resumeWatch } = pausableWatch(
    data,
    () => write(data.value),
    { flush, deep, eventFilter },
  );

  if (window && listenToStorageChanges) {
    useEventListener(window, 'storage', update);
    useEventListener(window, customStorageEventName, updateFromCustomEvent);
  }

  update();

  return data;

  function write(v) {
    try {
      if (v == null) {
        storage.removeItem(key);

      } else {
        const serialized = serializer.write(v);
        const oldValue = storage.getItem(key);
        if (oldValue !== serialized) {
          storage.setItem(key, serialized);

          // send custom event to communicate within same page
          // importantly this should _not_ be a StorageEvent since those cannot
          // be constructed with a non-built-in storage area
          if (window) {
            window.dispatchEvent(new CustomEvent(customStorageEventName, {
              detail: {
                key,
                oldValue,
                newValue: serialized,
                storageArea: storage,
              },
            }));
          }
        }
      }

    } catch (e) {
      onError(e);
    }
  }

  function read(event) {
    const rawValue = event ? event.newValue : storage.getItem(key);

    if (rawValue == null) {
      if (writeDefaults && rawInit !== null) {
        storage.setItem(key, serializer.write(rawInit));
      }
      return rawInit;

    } else if (!event && mergeDefaults) {
      const value = serializer.read(rawValue);
      if (typeof mergeDefaults === 'function') {
        return mergeDefaults(value, rawInit);
      } else if (type === 'object' && !Array.isArray(value)) {
        return { ...rawInit, ...value };
      }
      return value;

    } else if (typeof rawValue !== 'string') {
      return rawValue;

    } else {
      return serializer.read(rawValue);
    }
  }

  function updateFromCustomEvent(event) {
    update(event.detail);
  }

  function update(event) {
    if (event && event.storageArea !== storage) {
      return;
    }

    if (event && event.key == null) {
      data.value = rawInit;
      return;
    }

    if (event && event.key !== key) {
      return;
    }

    pauseWatch();
    try {
      data.value = read(event);
    }
    catch (e) {
      onError(e);
    }
    finally {
      // use nextTick to avoid infinite loop
      if (event)
        nextTick(resumeWatch);
      else
        resumeWatch();
    }
  }
}

/**
 * Reactive Storage in with async support.
 *
 * @see https://vueuse.org/useStorageAsync
 * @param key
 * @param initialValue
 * @param storage
 * @param options
 */
export function useStorageAsync(key, initialValue, storage, options = {}) {
  const {
    flush = 'pre',
    deep = true,
    listenToStorageChanges = true,
    writeDefaults = true,
    mergeDefaults = false,
    shallow,
    window = defaultWindow,
    eventFilter,
    onError = (e) => {
      console.error(e);
    },
  } = options;

  const rawInit = toValue(initialValue);
  const type = guessSerializerType(rawInit);

  const data = (shallow ? shallowRef : ref)(initialValue);
  const serializer = options.serializer ?? StorageSerializers[type];

  if (!storage) {
    try {
      storage = getSSRHandler('getDefaultStorage', () => defaultWindow?.localStorage)();
    } catch (e) {
      onError(e);
    }
  }

  async function read(event) {
    if (!storage || (event && event.key !== key)) {
      return;
    }

    try {
      const rawValue = event ? event.newValue : await storage.getItem(key);
      if (rawValue == null) {
        data.value = rawInit;
        if (writeDefaults && rawInit !== null) {
          await storage.setItem(key, await serializer.write(rawInit));
        }
      }
      else if (mergeDefaults) {
        const value = await serializer.read(rawValue);
        if (typeof mergeDefaults === 'function') {
          data.value = mergeDefaults(value, rawInit);
        } else if (type === 'object' && !Array.isArray(value)) {
          data.value = { ...(rawInit), ...value };
        } else {
          data.value = value;
        }
      } else {
        data.value = await serializer.read(rawValue);
      }
    } catch (e) {
      onError(e);
    }
  }

  read();

  if (window && listenToStorageChanges) {
    useEventListener(window, 'storage', e => Promise.resolve().then(() => read(e)));
  }

  if (storage) {
    watchWithFilter(
      data,
      async () => {
        try {
          if (data.value == null) {
            await storage.removeItem(key);
          } else {
            await storage.setItem(key, await serializer.write(data.value));
          }
        } catch (e) {
          onError(e);
        }
      },
      {
        flush,
        deep,
        eventFilter,
      },
    )
  }

  return data;
}

/**
 * Reactive LocalStorage.
 *
 * @see https://vueuse.org/useLocalStorage
 * @param key
 * @param initialValue
 * @param options
 */
export function useLocalStorage(key, initialValue, options = {}) {
  const { window = defaultWindow } = options;
  return useStorage(key, initialValue, window?.localStorage, options);
}

/**
 * Reactive SessionStorage.
 *
 * @see https://vueuse.org/useSessionStorage
 * @param key
 * @param initialValue
 * @param options
 */
export function useSessionStorage(key, initialValue, options = {}) {
  const { window = defaultWindow } = options;
  return useStorage(key, initialValue, window?.sessionStorage, options);
}