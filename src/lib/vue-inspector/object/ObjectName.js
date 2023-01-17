import { defineComponent, h } from 'vue';

export default {
  name: 'ObjectName',
  props: {
    name: {
      required: false,
    },
    dimmed: {
      type: Boolean,
      default: false,
    }
  },
  render() {
    return h('span', {
      class: [
        'object-name',
        {
          'dimmed': this.dimmed
        }
      ]
    }, this.name || '');
  }
};