import { defineComponent, h, normalizeStyle } from 'vue';

import TableHeader from './TableHeader.js';

export default {
  name: 'HeaderContainer',
  components: {
    TableHeader
  },
  props: {
    indexColumnText: {
      type: String,
      default: '#',
    },
    columns: {
      type: Array,
      default: [],
    },
    sorted: {
      type: Boolean,
      default: false,
    },
    sortIndexColumn: {
      type: Boolean,
      default: false,
    },
    sortColumn: {
      type: String,
      default: null,
    },
    sortAscending: {
      type: Boolean,
      default: false,
    },
  },
  emits: [ 'indexHeaderClick', 'headerClick' ],
  render() {
    const columns = this.columns;

    return h('div', { class: 'header-container' }, 
      h('table', null, 
        h('tbody', null, [
          h('tr', null, [
            h(TableHeader, {
              sorted: this.sorted && this.sortIndexColumn,
              sortAscending: this.sortAscending,
              borderStyle: 'border-none',
              onClick: (e) => this.$emit('indexHeaderClick', e),
            }, { default: () => this.indexColumnText }),

            ...(columns.map((column) => h(TableHeader, {
                key: column,
                sorted: this.sorted && this.sortColumn === column,
                sortAscending: this.sortAscending,
                borderStyle: 'border-solid',
                onClick: (e) => this.$emit('headerClick', column),
              }, { default: () => column })))
          ])
        ])
      )
    );
  },
};