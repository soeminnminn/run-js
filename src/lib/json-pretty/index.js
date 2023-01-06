import Tree from "./Tree.vue";

export default {
  install: function (Vue) {
    Vue.component('json-tree', Tree);
  }
};