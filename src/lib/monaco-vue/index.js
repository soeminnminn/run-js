import './userWorker';
import MonacoEditor from "./MonacoEditor.vue";

export default {
  install: function (Vue) {
    Vue.component('monaco-editor', MonacoEditor);
  }
};