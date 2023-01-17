import { defineComponent, h } from 'vue';

import TreeView from '../tree-view/TreeView.vue';
import ObjectRootLabel from './ObjectRootLabel.js';
import ObjectLabel from './ObjectLabel.js';
import createIterator from './dataIterator.js';

const defaultNodeRenderer = ({ depth, name, data, isNonenumerable, ...options }) => {
  if (depth == 0) {
    return h(ObjectRootLabel, {
      name,
      data,
      options
    });
  }

  return h(ObjectLabel, {
    name,
    data,
    isNonenumerable,
    options
  });
};

export default {
  name: 'ObjectInspector',
  components: {
    ObjectRootLabel,
    ObjectLabel,
    TreeView
  },
  props: {
    expandLevel: {
      type: Number,
      default: 0
    },
    expandPaths: {
      type: [String, Array],
      default: []
    },
    name: {
      required: false,
    },
    data: {
      required: false,
    },
    showNonenumerable: {
      type: Boolean,
      default: false,
    },
    sortObjectKeys: {
      type: [Boolean, Function],
      default: true,
    },
    arrayMaxProperties: {
      type: Number,
      default: 10,
    },
    objectMaxProperties: {
      type: Number,
      default: 5,
    },
  },
  computed: {
    dataIterator() {
      return createIterator(this.showNonenumerable, this.sortObjectKeys);
    },
    objectName() {
      if (typeof this.name === 'string' && this.name.length) {
        return this.name;
      }

      const data = this.data;
      if (typeof data !== 'object' || data === null || data instanceof Date || data instanceof RegExp) {
        return null;
      }
      return Array.isArray(data) ? 'Array' : 'Object';
    },
  },
  render() {
    const nodeRenderer = this.$slots.default || defaultNodeRenderer;

    return h(TreeView, {
      name: this.objectName,
      data: this.data,
      dataIterator: this.dataIterator,
      expandPaths: this.expandPaths,
      expandLevel: this.expandLevel,
      options: {
        showNonenumerable: this.showNonenumerable,
        sortObjectKeys: this.sortObjectKeys,
        arrayMaxProperties: this.arrayMaxProperties,
        objectMaxProperties: this.objectMaxProperties
      },
    }, {
      default: nodeRenderer
    });
  }
};