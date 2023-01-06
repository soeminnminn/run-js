// https://github.com/kil0ba/Vue-3-Socket.io
import SocketIO from 'socket.io-client';

class Emitter {
  constructor() {
    this.listeners = new Map();
  }

  /**
   * register new event listener with vuejs component instance
   * @param event
   * @param callback
   * @param component
   */
  addListener(event, callback, component) {
    if(typeof callback === 'function'){
      if (!this.listeners.has(event)) this.listeners.set(event, []);
      this.listeners.get(event).push({ callback, component });
    } else {
      throw new Error(`callback must be a function`);
    }
  }

  /**
   * remove a listenler
   * @param event
   * @param component
   */
  removeListener(event, component) {
    if(this.listeners.has(event)){
      const listeners = this.listeners.get(event).filter(listener => (
        listener.component !== component
      ));

      if (listeners.length > 0) {
        this.listeners.set(event, listeners);
      } else {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * broadcast incoming event to components
   * @param event
   * @param args
   */
  emit(event, args) {
    if(this.listeners.has(event)) {
      this.listeners.get(event).forEach((listener) => {
        listener.callback.call(listener.component, args);
      });
    }
  }
}

class Listener {
  static staticEvents = [
    'connect',
    'error',
    'disconnect',
    'reconnect',
    'reconnect_attempt',
    'reconnecting',
    'reconnect_error',
    'reconnect_failed',
    'connect_error',
    'connect_timeout',
    'connecting',
    'ping',
    'pong'
  ];

  constructor(io, emitter) {
    this.io = io;
    this.register();
    this.emitter = emitter;
  }

  /**
   * Listening all socket.io events
   */
  register() {
    this.io.onevent = (packet) => {
      let [event, ...args] = packet.data;
      if(args.length === 1) args = args[0];
      this.onEvent(event, args);
    };
    Listener.staticEvents.forEach(event => this.io.on(event, args => this.onEvent(event, args)));
  }

  /**
   * Broadcast all events to vuejs environment
   */
  onEvent(event, args) {
    this.emitter.emit(event, args);
  }
}

const mixin = {
  /**
   *  Assign runtime callbacks
   */
  beforeCreate() {
    if(!this.sockets) this.sockets = {};

    this.sockets.subscribe = (event, callback) => {
      this.$vueSocketIo.emitter.addListener(event, callback, this);
    };

    this.sockets.unsubscribe = (event) => {
      this.$vueSocketIo.emitter.removeListener(event, this);
    };
  },

  /**
   * Register all socket events
   */
  mounted() {
    if(this.$options.sockets){
      Object.keys(this.$options.sockets).forEach(event => {
        if(event !== 'subscribe' && event !== 'unsubscribe') {
          this.$vueSocketIo.emitter.addListener(event, this.$options.sockets[event], this);
        }
      });
    }
  },

  /**
   * unsubscribe when component unmounting
   */
  beforeUnmount() {
    if(this.$options.sockets){
      Object.keys(this.$options.sockets).forEach(event => {
        this.$vueSocketIo.emitter.removeListener(event, this);
      });
    }
  },
};

export default class VueSocketIO {
  /**
   * lets take all resource
   * @param io
   * @param options
   */
  constructor({connection, options}) {
    this.io = this.connect(connection, options);
    this.emitter = new Emitter();
    this.listener = new Listener(this.io, this.emitter);
  }

  /**
   * Vue.js entry point
   * @param Vue
   */
  install(Vue) {
    Vue.provide('socket', this.io)
    Vue.config.globalProperties.$socket = this.io;
    Vue.config.globalProperties.$vueSocketIo = this;

    Vue.mixin(mixin);
  }

  /**
   * registering SocketIO instance
   * @param connection
   * @param options
   */
  connect(connection, options) {
    if (connection && typeof connection === 'object') {
      return connection;
    } else if (typeof connection === 'string') {
      return this.io = SocketIO(connection, options);
    }
    throw new Error('Unsupported connection type');
  }
}

