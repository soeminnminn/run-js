<style scoped>
.tab-list {
  display: flex;
  width: 100%;
  list-style-type: none;
  flex-flow: row;
  align-items: flex-end;
  padding: 0.25rem 1rem 0 1rem;
  margin: 0;
}
.tab-list.border-bottom {
  border-bottom: 1px solid #4F4F4F;
}
:deep(.tab) {
  display: flex;
  flex-flow: row;
  align-items: center;
  margin: 0 0.5rem -1px 0;
  border: 1px solid #4F4F4F;
  border-bottom: 1px solid transparent;
  border-radius: 0.5rem 0.5rem 0 0;
  overflow: hidden;
  cursor: pointer;
  padding: .25rem .5rem;
  font-size: 90%;
  height: 2rem!important;
}
:deep(.tab) a {
  text-decoration: none;
  display: inline-block;
  white-space: nowrap;
}
:deep(.tab) .icon {
  margin-right: 0.25rem;
}
:deep(.tab).selected {
  background-color: rgb(30, 30, 30);
  border-bottom: 2px solid rgb(30, 30, 30);
}
:deep(.tab) .close {
  width: 1.25rem;
  height: 1.25rem;
  position: relative;
  margin-left: 0.5rem;
  border-radius: 0.75rem!important;
  padding: 0!important;
  background-color: transparent;
  outline: none!important;
  border: none!important;
  cursor: pointer;
}
:deep(.tab) .close:hover {
  background-color: #424649;
}
:deep(.tab) .close::before, :deep(.tab) .close::after {
  position: absolute;
  left: 0.575rem;
  margin-top: -0.375rem;
  content: '';
  height: 0.75rem;
  width: 2px;
  background-color: white;
}
:deep(.tab) .close::before {
  transform: rotate(45deg);
}
:deep(.tab) .close::after {
  transform: rotate(-45deg);
}
:deep(.tab-add) {
  display: block;
  width: 2rem;
  border: 1px solid #4F4F4F;
  border-width: 1px 1px 0 1px;
  border-radius: 0.5rem 0.5rem 0 0;
  overflow: hidden;
  cursor: pointer;
  height: 1.75rem;
  position: relative;
}
:deep(.tab-add):hover {
  background-color: #424649;
}
:deep(.tab-add)::before, :deep(.tab-add)::after {
  position: absolute;
  left: 0.875rem;
  margin-top: 0.375rem;
  content: '';
  height: 1rem;
  background-color: white;
  border-radius: 1px;
}
:deep(.tab-add)::before {
  transform: rotate(90deg);
  width: 2px;
}
:deep(.tab-add)::after {
  transform: rotate(180deg);
  width: 1.5px;
}
</style>

<script>
import { defineComponent, h } from 'vue';

export const TabItem = defineComponent({
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
});

export const TabAdd = defineComponent({
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
});

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
}
</script>