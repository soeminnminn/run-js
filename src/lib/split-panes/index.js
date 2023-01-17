import SplitPanes from './SplitPanes.js';
import Pane from './Pane.js';

export { SplitPanes, Pane };

export default {
  install: function (Vue) {
    Vue.component('pane', Pane);
    Vue.component('split-panes', SplitPanes);
  }
};