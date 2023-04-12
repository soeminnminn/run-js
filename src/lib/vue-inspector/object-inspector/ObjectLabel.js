import { h } from 'vue';

import ObjectName from '../object/ObjectName.js';
import ObjectValue from '../object/ObjectValue.js';
import ObjectPreview from './ObjectPreview.js';

export default {
  name: 'ObjectLabel',
  components: {
    ObjectName,
    ObjectValue,
    ObjectPreview
  },
  props: {
    name: {
      required: false,
    },
    data: {
      required: false,
    },
    isNonenumerable: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Object,
      default: {}
    },
  },
  render() {
    const children = [];

    if (typeof this.name === 'string') {
      children.push(h(ObjectName, {
        name: this.name,
        dimmed: this.isNonenumerable
      }));

    } else {
      children.push(h(ObjectPreview, {
        data: this.name,
        arrayMaxProperties: this.options.arrayMaxProperties,
        objectMaxProperties: this.options.objectMaxProperties,
      }, {}));
    }

    children.push(h('span', null, ': '));
    children.push(h(ObjectValue, {
      data: this.data
    }));

    return h('span', { class: 'object-label' }, children);
  }
};