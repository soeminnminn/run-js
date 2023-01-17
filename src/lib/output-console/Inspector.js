import { defineComponent, h } from 'vue';

import {
  DOMInspector,
  TableInspector,
  ObjectInspector,
  ObjectLabel,
  ObjectName,
  ObjectValue,
  ObjectPreview,
} from '../vue-inspector';

import ErrorPanel from './ErrorPanel.js';

const REMAINING_KEY = '__console_feed_remaining__';

// copied from react-inspector
function intersperse(arr, sep) {
  if (arr.length === 0) {
    return [];
  }

  return arr.slice(1).reduce((xs, x) => xs.concat([sep, x]), [arr[0]]);
}

const getArrayLength = (array) => {
  const remaining = parseInt(array[array.length - 1].split(REMAINING_KEY)[1]);
  return array.length - 1 + remaining;
};

const MsgObjectRootLabel = defineComponent({
  name: 'MsgObjectRootLabel',
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
    rootData() {
      let rootData = this.data;
      if (typeof this.data === 'object' && !Array.isArray(this.data) && this.data !== null) {
        const object = {};
        for (const propertyName in this.data) {
          if (this.data.hasOwnProperty(propertyName)) {
            const propertyValue = this.data[propertyName];
            if (Array.isArray(propertyValue)) {
              const arrayLength = getArrayLength(propertyValue);
              object[propertyName] = new Array(arrayLength);
            } else {
              object[propertyName] = propertyValue;
            }
          }
        }
        rootData = Object.assign(Object.create(Object.getPrototypeOf(this.data)), object);
      }
      return rootData;
    },
  },
  render() {
    const options = {
      arrayMaxProperties: this.arrayMaxProperties,
      objectMaxProperties: this.objectMaxProperties,
    };

    if (typeof this.name === 'string') {
      return h('span', null, [
        h(ObjectName, { name: this.name }),
        h('span', null, ': '),
        h(ObjectPreview, { data: this.rootData, ...options })
      ]);
    }

    return h(ObjectPreview, { data: this.rootData, ...options });
  },
});

const MsgObjectLabel = defineComponent({
  name: 'MsgObjectLabel',
  components: {
    ObjectName,
    ObjectPreview,
    ObjectValue
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
    if (this.name == REMAINING_KEY) {
      if (this.data > 0) {
        return h('span', null, `${this.data} more...`);
      }
      return null;

    } else {
      const options = {
        arrayMaxProperties: this.options.arrayMaxProperties,
        objectMaxProperties: this.options.objectMaxProperties,
      };

      const children= [];
      if (typeof this.name === 'string') {
        children.push(h(ObjectName, { name: this.name, dimmed: this.isNonenumerable }));
      } else {
        children.push(h(ObjectPreview, { data: this.name, ...options }));
      }

      children.push(h('span', null, ': '));
      children.push(h(ObjectValue, { data: this.data }));

      return h('span', null, children);
    }
  }
});

export default {
  name: 'Inspector',
  components: {
    ObjectInspector,
    DOMInspector,
    TableInspector,
    ObjectPreview,
    ObjectLabel,
    ObjectName,
    ObjectValue,
    ErrorPanel,
    MsgObjectRootLabel,
    MsgObjectLabel
  },
  props: {
    data: {
      required: false
    },
    columns: {
      type: Array,
      default: undefined
    },
    method: {
      type: String,
      default: ''
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
  methods: {
    getCustomNode(data) {
      const constructor = data?.constructor?.name;
      if (constructor === 'Function') {
        return h('span', { style: { fontStyle: 'italic' } }, [
          h(ObjectPreview, { data }),
          ' {',
          h('span', { style: { color: 'rgb(181, 181, 181)' } }, data.body),
          '}'
        ]);
      }

      if (data instanceof Error && typeof data.stack === 'string') {
        return h(ErrorPanel, { error: data.stack });
      }

      if (constructor === 'Promise') {
        return h('span', { style: { fontStyle: 'italic' } }, [
          'Promise {',
          h('span', { style: { opacity: 0.6 } }, '<pending>'),
          '}'
        ]);
      }

      if (data instanceof HTMLElement) {
        return h('span', { class: 'inspector-html' }, 
          h(DOMInspector, { data })
        );
      }

      if (Array.isArray(data)) {
        const arrayLength = getArrayLength(data);
        const maxProperties = this.arrayMaxProperties;
        const previewArray = data
          .slice(0, -1)
          .slice(0, maxProperties)
          .map((element, index) => {
            if (Array.isArray(element)) {
              return h(ObjectValue, { key: index, data: new Array(getArrayLength(element)) });
            }

            return h(ObjectValue, { key: index, data: element });
          });

        if (arrayLength > maxProperties) {
          previewArray.push(h('span', { key: 'ellipsis' }, '…'))
        }

        return [
          h('span', { class: 'object-description' }, arrayLength === 0 ? '' : `(${arrayLength})\xa0`),
          h('span', { class: 'preview' }, [ '[ ', ...intersperse(previewArray, ', '), ' ]' ])
        ];
      }

      return null;
    },
    nodeRenderer() {
      const _this = this;

      const options = {
        arrayMaxProperties: this.arrayMaxProperties,
        objectMaxProperties: this.objectMaxProperties,
      };

      return (props) => {
        let { depth, name, data, isNonenumerable } = props;
        
        // Root
        if (depth === 0) {
          const customNode = this.getCustomNode(data)
          return customNode || h(MsgObjectRootLabel, { name, data, ...options });
        }

        if (typeof data === 'string' && data.includes(REMAINING_KEY)) {
          name = REMAINING_KEY;
          data = data.split(REMAINING_KEY)[1];
        }

        if (name === 'constructor') {
          return h('span', { class: 'inspector-constructor' }, 
            h(ObjectLabel, { name: '<constructor>', data: data.name, isNonenumerable })
          );
        }

        let customNode = _this.getCustomNode(data);
        if (customNode) {
          if (!Array.isArray(customNode)) customNode = [ customNode ];
          
          return h('div', { class: 'message-inspector' }, [
            h(ObjectName, { name }),
            h('span', null, ': '),
            ...customNode,
          ]);
        }

        return h(MsgObjectLabel, { name, data, isNonenumerable });
      };
    },
  },
  render() {
    const data = this.data;
    const dom = data instanceof HTMLElement;
    const table = this.method === 'table';
    const nodeRenderer = this.nodeRenderer();

    let child = undefined;
    if (table) {
      child = h('span', { class: 'inspector-table' }, [
        h(TableInspector, { data, columns: this.columns })
      ]);

    } else if (dom) {
      child = h('span', { class: 'inspector-html' }, 
        h(DOMInspector, { data })
      );

    } else {
      child = h(ObjectInspector, { data }, { default: nodeRenderer });
    }

    return h('div', { 'data-type': table ? 'table' : dom ? 'html' : 'object' }, child);
  },
};