/**
 * Specs:
 * https://developer.chrome.com/devtools/docs/commandline-api#tabledata-columns
 * https://developer.mozilla.org/en-US/docs/Web/API/Console/table
 */

import { h } from 'vue';

import DataContainer from './DataContainer.js';
import HeaderContainer from './HeaderContainer.js';
import { hasOwnProperty } from '../utils.js';

const INDEX_HEADER = '(index)';
const VALUE_HEADER = 'value';

export default {
  name: 'TableInspector',
  components: {
    HeaderContainer,
    DataContainer
  },
  props: {
    data: {
      type: [Array, Object],
      default: []
    },
    columns: {
      type: Array,
      default: undefined
    }
  },
  data() {
    return {
      sortedData: {
        // has user ever clicked the <th> tag to sort?
        sorted: false,
        // is index column sorted?
        sortIndexColumn: false,
        // which column is sorted?
        sortColumn: undefined,
        // is sorting ascending or descending?
        sortAscending: false,
      },
      computedData: {
        // computed data
        rowHeaders: [],
        colHeaders: [],
        rowsData: [],
      }      
    };
  },
  mounted() {
    this.$nextTick(() => this.sortTableData(this.sortedData));
  },
  methods: {
    tableData() {
      const tableData = typeof(this.data) == 'object' ? this.data : [ this.data ];
      const colDefined = this.columns && this.columns.length > 0;
      let columns = colDefined ? this.columns : [];
      const rowKeys = Object.keys(tableData);

      if (!colDefined) {
        const objCols = Object.values(tableData).reduce((cols, item) => {
          const keys = typeof(item) == 'object' ? Object.keys(item) : [VALUE_HEADER];
          for (const k of keys) {
            if (!~cols.indexOf(k)) {
              cols.push(k);
            }
          }
          return cols;
        }, []);

        columns = columns.concat(objCols);
      }

      const rows = rowKeys.map(key => {
        const row = [];
        const item = tableData[key];
        if (typeof item !== 'object') {
          row.push(item);
        } else {
          for(const col of columns) {
            row.push(item[col]);
          }
        }
        return row;
      });

      return { rowHeaders: rowKeys, colHeaders: columns, rowsData: rows };
    },
    sortTableData(sortedData) {
      const data = this.data;

      const sortColumn = sortedData.sortColumn;
      const sortIndexColumn = sortedData.sortIndexColumn;
      const sortAscending = sortedData.sortAscending;

      let { rowHeaders, colHeaders, rowsData } = this.tableData();

      let columnDataWithRowIndexes; /* row indexes are [0..nRows-1] */
      if (sortColumn !== undefined) {
        // the column to be sorted (rowsData, column) => [[columnData, rowIndex]]
        columnDataWithRowIndexes = rowsData.map((rowData, index) => {
          // normalize rowData
          if (typeof rowData === 'object' && rowData !== null) {
            let columnData = undefined;
            if (hasOwnProperty.call(rowData, sortColumn)) {
              columnData = rowData[sortColumn];
            } else {
              const colIdx = colHeaders.indexOf(sortColumn);
              columnData = rowData[colIdx];
            }
            return [columnData, index];
          }
          return [undefined, index];
        });

      } else {
        if (sortIndexColumn) {
          columnDataWithRowIndexes = rowHeaders.map((rowData, index) => {
            const columnData = rowHeaders[index];
            return [columnData, index];
          });
        }
      }

      if (columnDataWithRowIndexes !== undefined) {
        // apply a mapper before sorting (because we need to access inside a container)
        const comparator = (mapper, ascending) => {
          return (a, b) => {
            const v1 = mapper(a); // the datum
            const v2 = mapper(b);
            const type1 = typeof v1;
            const type2 = typeof v2;
            
            // use '<' operator to compare same type of values or compare type precedence order #
            const lt = (v1, v2) => {
              if (v1 < v2) {
                return -1;
              } else if (v1 > v2) {
                return 1;
              } else {
                return 0;
              }
            };
            
            let result;
            if (type1 === type2) {
              result = lt(v1, v2);
            } else {
              // order of different types
              const order = {
                string: 0,
                number: 1,
                object: 2,
                symbol: 3,
                boolean: 4,
                undefined: 5,
                function: 6,
              };
              result = lt(order[type1], order[type2]);
            }
            // reverse result if descending
            if (!ascending) result = -result;
            return result;
          };
        };
        
        const sortedRowIndexes = columnDataWithRowIndexes
          .sort(comparator((item) => item[0], sortAscending))
          .map((item) => item[1]); // sorted row indexes
          
        rowHeaders = sortedRowIndexes.map((i) => rowHeaders[i]);
        rowsData = sortedRowIndexes.map((i) => rowsData[i]);
      }

      this.computedData = {
        colHeaders,
        rowHeaders,
        rowsData
      };
    },
    handleIndexHeaderClick(e) {
      const sortedData = {
        sorted: true,
        sortIndexColumn: true,
        sortColumn: undefined,
        // when changed to a new column, default to asending
        sortAscending: this.sortedData.sortIndexColumn ? !this.sortedData.sortAscending : true
      };

      this.sortTableData(sortedData);
      this.sortedData = sortedData;
    },
    handleHeaderClick(col) {
      const sortedData = {
        sorted: true,
        sortIndexColumn: false,
        // update sort column
        sortColumn: col,
        // when changed to a new column, default to asending
        sortAscending: col === this.sortedData.sortColumn ? !this.sortedData.sortAscending : true
      };

      this.sortTableData(sortedData);
      this.sortedData = sortedData;
    },
  },
  render() {
    if (typeof this.data !== 'object' || this.data === null) {
      return h('div');
    }
    const computedData = this.computedData;
    const sortedData = this.sortedData;

    return h('div', { class: 'table-inspector' },
      h(HeaderContainer, {
        indexColumnText: INDEX_HEADER,
        columns: computedData.colHeaders,
        /* for sorting */
        sorted: sortedData.sorted,
        sortIndexColumn: sortedData.sortIndexColumn,
        sortColumn: sortedData.sortColumn,
        sortAscending: sortedData.sortAscending,

        onIndexHeaderClick: (e) => this.handleIndexHeaderClick(e),
        onHeaderClick: (e) => this.handleHeaderClick(e),
      }),

      h(DataContainer, {
        rows: computedData.rowHeaders,
        columns: computedData.colHeaders, 
        rowsData: computedData.rowsData,
      }),
    );
  }
};