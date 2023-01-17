import { defineComponent, h } from 'vue';

import ObjectName from '../object/ObjectName.js';
import ObjectPreview from './ObjectPreview.js';

export default {
  name: 'ObjectRootLabel',
  components: {
    ObjectName,
    ObjectPreview
  },
  props: {
    name: {
      required: false,
    },
    data: {
      required: false,
    },
    options: {
      type: Object,
      default: {}
    },
  },
  render() {
    if (typeof this.name === 'string') {
      return h('span', { class: 'object-label root' }, [
        h(ObjectName, { name: this.name }),

        h('span', null, ':'),
        
        h(ObjectPreview, {
          data: this.data,
          arrayMaxProperties: this.options.arrayMaxProperties,
          objectMaxProperties: this.options.objectMaxProperties,
        })
      ]);

    } else {
      return h(ObjectPreview, {
        data: this.data,
        arrayMaxProperties: this.options.arrayMaxProperties,
        objectMaxProperties: this.options.objectMaxProperties,
      });
    }
  }
};