import { h } from 'vue';

export default {
  name: 'TabItem',
  props: {
    selected: {
      type: Boolean,
      default: false
    },
    closable: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
  },
  emits: [ 'click', 'closeClick' ],
  inject: [ 'onItemClick', 'onItemCloseClick' ],
  methods: {
    handleClick(e) {
      if (this.disabled) return;
      if (e.target != this.$el) return;

      if (typeof(this.onItemClick) == 'function') {
        this.onItemClick(this);
      }
      this.$emit('click', e);
    },
    handleCloseClick(e) {
      if (this.disabled) return;

      if (typeof(this.onItemCloseClick) == 'function') {
        this.onItemCloseClick(this);
      }
      this.$emit('closeClick', e);
    },
  },
  render() {
    const children = [this.$slots.default({})];
    if (this.closable) {
      children.push(h('button', { 
        class: 'close', 
        type: 'button', 
        onClick: (e) => this.handleCloseClick(e) 
      }));
    }
    return h('li', { 
      class: [ 
        'tab', { 'selected': this.selected }
      ],
      onClick: (e) => this.handleClick(e),
    }, children);
  },
};