import { defineComponent, h } from 'vue';

import ObjectValue from '../object/ObjectValue.js';
import { hasOwnProperty } from '../utils.js';

export default {
  name: 'DataContainer',
  components: {
    ObjectValue
  },
  props: {
    rows: {
      type: Array,
      default: [],
    },
    columns: {
      type: Array,
      default: [],
    },
    rowsData: {
      type: Array,
      default: [],
    }
  },
  render() {
    const rows = this.rows;
    const columns = this.columns;
    const rowsData = this.rowsData;

    return h('div', { class: 'data-container' }, 
      h('table', null, [
        h('colgroup'),
        h('tbody', null,
          rows.map((row, i) => {
            return h('tr', { key: row }, [
              h('td', { class: 'border-none' }, row),
              ...(columns.map((column) => {
                  const rowData = rowsData[i];
                  // rowData could be
                  //  object -> index by key
                  //    array -> index by array index
                  //    null -> pass
                  //  boolean -> pass
                  //  string -> pass (hasOwnProperty returns true for [0..len-1])
                  //  number -> pass
                  //  function -> pass
                  //  symbol
                  //  undefined -> pass
                  if (typeof rowData === 'object' && rowData !== null) {
                    if (hasOwnProperty.call(rowData, column)) {
                      return h('td', { key: column, class: 'border-solid' }, 
                        h(ObjectValue, { data: rowData[column] })
                      );  
                    } else if (Array.isArray(rowData) && rowData.length) {
                      return h('td', { key: column, class: 'border-solid' }, 
                        h(ObjectValue, { data: rowData[0] })
                      );
                    }
                  }
                  return h('td', { key: column, class: 'border-solid' }, rowData);
                }))
            ]);
          })
        )
      ])
    );
  }
};