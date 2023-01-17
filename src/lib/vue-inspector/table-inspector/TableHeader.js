import { defineComponent, h, normalizeStyle } from 'vue';

const SortIconContainer = defineComponent({
  name: 'SortIconContainer',
  render() {
    return h('div', { class: 'sort-icon-container' }, this.$slots.default({}));
  }
});

const SortIcon = defineComponent({
  name: 'SortIcon',
  props: {
    sortAscending: {
      type: Boolean,
      default: false,
    }
  },
  render() {
    return h('div', { class: 'sort-icon' }, this.sortAscending ? '▲' : '▼');
  }
});

export default {
  name: 'TableHeader',
  components: {
    SortIconContainer,
    SortIcon
  },
  props: {
    sortAscending: {
      type: Boolean,
      default: false,
    },
    sorted: {
      type: Boolean,
      default: false,
    },
    borderStyle: {
      type: String,
      default: '',
    }
  },
  emits: [ 'click' ],
  render() {
    return h('th', {
      class: [ 'table-header', this.borderStyle ],
      onClick: (e) => this.$emit('click', e),
    }, [
      h('div', { class: 'header-text' }, this.$slots.default({})),
      this.sorted && h(SortIconContainer, null, {
        default: () => h(SortIcon, { sortAscending: this.sortAscending })
      }),
    ]);
  },
};