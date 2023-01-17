import { h } from 'vue';

export default {
  name: 'TabAdd',
  emits: [ 'click' ],
  inject: [ 'onItemAddClick' ],
  methods: {
    handleClick(e) {
      if (typeof(this.onItemAddClick) == 'function') {
        this.onItemAddClick(this);
      }
      this.$emit('click', e);
    },
  },
  render() {
    return h('li', { 
      class: 'tab-add',
      onClick: (e) => this.handleClick(e),
    });
  },
};