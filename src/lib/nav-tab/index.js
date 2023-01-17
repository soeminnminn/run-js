import TabItem from './TabItem.js';
import TabAdd from './TabAdd.js';
import Tab from './Tab.js';

export { TabItem, TabAdd, Tab };

export default {
  install: function (Vue) {
    Vue.component('nav-tabitem', TabItem);
    Vue.component('nav-tabadd', TabAdd);
    Vue.component('nav-tab', Tab);
  }
};