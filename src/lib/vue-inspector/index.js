import DOMInspector from './dom-inspector/DOMInspector.js';
import ObjectInspector from './object-inspector/ObjectInspector.js';
import TableInspector from './table-inspector/TableInspector.js';

import ObjectLabel from './object-inspector/ObjectLabel.js';
import ObjectPreview from './object-inspector/ObjectPreview.js';
import ObjectRootLabel from './object-inspector/ObjectRootLabel.js';

import ObjectName from './object/ObjectName.js';
import ObjectValue from './object/ObjectValue.js';

import TreeView from './tree-view/TreeView.vue';

export default {
  install: function (Vue) {
    Vue.component('dom-inspector', DOMInspector);
    Vue.component('object-inspector', ObjectInspector);
    Vue.component('table-inspector', TableInspector);
  }
};

export {
  DOMInspector,
  ObjectInspector,
  ObjectLabel,
  ObjectPreview,
  ObjectRootLabel,
  ObjectName,
  ObjectValue,
  TableInspector,
  TreeView
}