import { defineComponent, h } from 'vue';

import { TreeView } from '../vue-inspector';
import Linkify from './Linkify.js';

export default {
  name: 'ErrorPanel',
  components: {
    TreeView,
    Linkify
  },
  props: {
    error: {
      type: String,
      required: true,
    }
  },
  computed: {
    errorLines() {
      const lines = this.error.split(/[\r\n]/).reduce((t, x) => {
        if (x && x.trim() != '') t.push(x);
        return t;
      }, []);

      let firstLine = '';
      let otherErrorLines = [];
      if (lines.length) {
        firstLine = lines[0];
        otherErrorLines = lines.slice(1);
      }
      return { firstLine, otherErrorLines };
    },
    treeDataIterator() {
      return function* (data) {
        if (data && typeof data === 'object') {
          if (Array.isArray(data)) {
            for(const i in data) {
              yield {
                name: data[i]
              }
            }

          } else {
            yield {
              name: data
            }
          }
        }
      };
    }
  },
  render() {
    const { firstLine, otherErrorLines } = this.errorLines;
    const nodeRenderer = ({ name }) => h(Linkify, { text: name, escape: false });

    return h('div', { class: 'error-summary' }, 
      h(TreeView, { 
        name: firstLine, 
        data: otherErrorLines,
        dataIterator: this.treeDataIterator
      }, { default: nodeRenderer })
    );
  }
};