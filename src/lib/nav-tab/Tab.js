import { h } from 'vue';

export default {
  name: 'TabList',
  props: {
    bottomBorder: {
      type: Boolean,
      default: true,
    }
  },
  emits: [ 'itemClick', 'itemCloseClick', 'itemAddClick' ],
  provide() {
    return {
      onItemClick: (e) => {
        this.$emit('itemClick', e);
      },
      onItemCloseClick: (e) => {
        this.$emit('itemCloseClick', e);
      },
      onItemAddClick: (e) => {
        this.$emit('itemAddClick', e);
      },
    };
  },
  render() {
    return h('ul', { 
      class: [
        'tab-list', 
        { 'border-bottom': this.bottomBorder } 
      ] 
    }, this.$slots.default({}));
  }
};