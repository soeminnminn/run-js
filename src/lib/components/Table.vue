<template>
  <div :class="{
    'table': true, 
    'table-primary': variant == 'primary', 
    'table-secondary': variant == 'secondary', 
    'table-success': variant == 'success', 
    'table-danger': variant == 'danger', 
    'table-warning': variant == 'warning', 
    'table-info': variant == 'info', 
    'table-light': variant == 'light', 
    'table-dark': variant == 'dark',
  }">
    
    <div class="row header">
      <template v-for="(col, colIdx) in tableData.columns" :key="colIdx">
        <div class="cell">{{ col }}</div>
      </template>
    </div>

    <template v-for="(row, rowIdx) in tableData.rows" :key="rowIdx">
      <div class="row">
        <template v-for="(col, colIdx) in tableData.columns" :key="colIdx">
          <div class="cell" :data-title="col">{{ row[colIdx] }}</div>
        </template>
      </div>
    </template>

  </div>
</template>

<style scoped lang="scss">
.wrapper {
  margin: 0 auto;
  padding: 3.275rem;
  max-width: 100%;
}

.table {
  width: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  display: table;

  .row {
    display: table-row;

    &:nth-of-type(odd) {
      background: rgba(0, 0, 0, 0.2);
    }

    .cell {
      padding: .25rem .75rem;
      display: table-cell;
    }

    &.header {
      font-weight: 900;
      color: #ffffff;

      .cell {
        padding: 0 .75rem;
      }
    }
  }

  @media screen and (max-width: 580px) {
    display: block;

    .row {
      padding: 1.275rem 0 0.75rem;
      display: block;

      &.header {
        padding: 0;
        height: 0.5rem;

        .cell {
          display: none;
        }
      }

      .cell {
        padding: .175rem 1.25rem;
        display: block;
        margin-bottom: 0.825rem;

        &:before {
          margin-bottom: .175rem;
          content: attr(data-title);
          min-width: 8.175rem;
          font-size: 0.825rem;
          line-height: 0.825rem;
          font-weight: bold;
          text-transform: uppercase;
          color: #969696;
          display: block;
        }
      }
    }
  }

  &-primary {
    outline: 1px solid #0d6efd;

    .row.header {
      background: #0d6efd;
    }
  }
  &-secondary {
    outline: 1px solid #6c757d;

    .row.header {
      background: #6c757d;
    }
  }
  &-success {
    outline: 1px solid #198754;

    .row.header {
      background: #198754;
    }
  }

  &-warning {
    outline: 1px solid #ffc107;

    .row.header {
      background: #ffc107;
    }
  }

  &-danger{
    outline: 1px solid #dc3545;

    .row.header {
      background: #dc3545;
    }
  }

  &-info {
    outline: 1px solid #0dcaf0;

    .row.header {
      background: #0dcaf0;
    }
  }

  &-light {
    outline: 1px solid #f8f9fa;

    .row.header {
      background: #f8f9fa;
      color: #858585;
    }
  }
  &-dark {
    outline: 1px solid #212529;

    .row.header {
      background: #212529;
      color: #f8f9fa;
    }
  }
}
</style>

<script>
const variants = ['none', 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
const indexHeader = '(index)';
const valueHeader = 'value';

export default {
  name: 'Table',
  props: {
    tabularData: {},
    columns: {
      type: Array,
      default: []
    },
    variant: {
      type: String,
      default: 'none',
      validator: v => !!~variants.indexOf(v),
    },
  },
  computed: {
    tableData() {
      const tableData = typeof(this.tabularData) == 'object' ? this.tabularData : [ this.tabularData ];
      const colDefined = this.columns && this.columns.length > 0;
      let columns = colDefined ? [indexHeader].concat(this.columns) : [indexHeader];
      const rowKeys = Object.keys(tableData);

      if (!colDefined) {
        const objCols = Object.values(tableData).reduce((cols, item) => {
          const keys = typeof(item) == 'object' ? Object.keys(item) : [valueHeader];
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
        const row = [ key ];
        const item = tableData[key];
        if (typeof(item) !== 'object') {
          row.push(`${item}`);
        } else {
          for(const col of columns) {
            if (col == indexHeader) continue;
            row.push(`${item[col] || ''}`);
          }
        }
        return row;
      });

      return { columns, rows };
    },
  }
}
</script>