import OutputConsole from './Output.vue';

export default {
  install: function (Vue) {
    Vue.component('output-console', OutputConsole);
  }
};

export {
  OutputConsole
};