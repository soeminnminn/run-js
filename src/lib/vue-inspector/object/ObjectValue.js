import { defineComponent, h } from 'vue';

export default {
  name: 'ObjectValue',
  props: {
    data: {
      required: false,
    },
  },
  render() {
    const data = this.data || '';

    switch (typeof data) {
      case 'bigint':
        return h('span', { class: 'object-value number' }, `${String(data)}n`);
      case 'number':
        return h('span', { class: 'object-value number' }, `${String(data)}`);
      case 'string':
        return h('span', { class: 'object-value string' }, `"${data}"`);
      case 'boolean':
        return h('span', { class: 'object-value boolean' }, `${String(data)}`);
      case 'undefined':
        return h('span', { class: 'object-value undefined' }, 'undefined');
      case 'object':
        if (data === null) {
          return h('span', { class: 'object-value null' }, 'null');
        }
        if (data instanceof Date) {
          return h('span', { class: 'object-value' }, `${data.toString()}`);
        }
        if (data instanceof RegExp) {
          return h('span', { class: 'object-value regexp' }, `${data.toString()}`);
        }
        if (Array.isArray(data)) {
          return h('span', { class: 'object-value' }, `Array(${data.length})`);
        }
        if (!data.constructor) {
          return h('span', { class: 'object-value' }, 'Object');
        }
        if (typeof data.constructor.isBuffer === 'function' && data.constructor.isBuffer(data)) {
          return h('span', { class: 'object-value' }, `Buffer[${data.length}]`);
        }
  
        return h('span', { class: 'object-value' }, `${data.constructor.name}`);
      case 'function':
        return h('span', { class: 'object-value' }, [
          h('span', { class: 'function-prefix' }, 'ƒ '),
          h('span', { class: 'function-name' }, `${data.name}`)
        ]);
      case 'symbol':
        return h('span', { class: 'object-value symbol' }, `${data.toString()}`);
      default:
        return h('span', { class: 'object-value' });
    }
  }
};