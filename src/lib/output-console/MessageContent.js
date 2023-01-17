import { defineComponent, h } from 'vue';

import { format } from './string-formatter.js';
import ErrorPanel from './ErrorPanel.js';

import linkifyHtml from 'linkify-html';
import Linkify from './Linkify.js';

import Highlight from './Highlight.js';
import Inspector from './Inspector.js';

// https://developer.mozilla.org/en-US/docs/Web/API/console#Using_string_substitutions
const reSubstitutions = /(%[coOs])|(%(([0-9]*[.])?[0-9]+)?[dif])/g;

const Formatted = defineComponent({
  name: 'Formatted',
  props: {
    data: {
      default: []
    }
  },
  computed: {
    formatedMessage() {
      const args = this.data;
      if (!args.length) {
        return '';
      } else if (args.length == 1) {
        return args[0];
      }
      const formated = format(args[0], args.slice(1));
      const html = formated.formattedResult.split(/[\r\n]/).join('<br />');
      return linkifyHtml(html);
    }
  },
  render() {
    return h('div', { class: 'message-inspector', 'data-type': 'formatted', innerHTML: this.formatedMessage });
  }
});

const ObjectTree  = defineComponent({
  name: 'ObjectTree',
  components: {
    Linkify,
    Inspector,
    Highlight
  },
  props: {
    quoted: {
      type: Boolean,
      default: true,
    },
    log: {
      type: Object,
      default: {}
    },
    linkifyOptions: {
      type: Object,
      default: {}
    }
  },
  render() {
    const { quoted, log, linkifyOptions } = this.$props;
    
    return log.data.map((message, i) => {
      if (typeof message === 'string') {
        
        if (log.method == 'command') {
          return h(Highlight, { code: message, language: 'javascript' });
        }

        let children = [];
        if (quoted) {
          children = [
            h('span', null, '"'),
            h(Linkify, { text: message, options: linkifyOptions }),
            h('span', null, '" ')
          ];

        } else {
          children.push(h(Linkify, { text: message, options: linkifyOptions }));
        }

        return h('div', { class: 'message-header', 'data-type': 'string', key: i }, children);
      }

      return h(Inspector, { data: message, key: i, method: log.method, columns: log.columns });
    });
  }
});

export default {
  name: 'MessageContent',
  components: {
    Formatted,
    ErrorPanel,
    ObjectTree
  },
  props: {
    log: {
      type: Object,
      default: {}
    },
    linkifyOptions: {
      type: Object,
      default: {}
    }
  },
  methods: {
    getNode() {
      const log = this.log;

      // Error handling
      const error = this.typeCheck(log);
      if (error) return error;
      
      // Chrome formatting
      if (log.data.length > 0 && typeof log.data[0] === 'string') {
        const matchLength = log.data[0].match(reSubstitutions)?.length;
        if (matchLength) {
          const restData = log.data.slice(1 + matchLength);
          return [
            h(Formatted, { data: log.data }),
            restData.length > 0 && h(ObjectTree, { 
              quoted: false, 
              log: { ...log, data: restData }, 
              linkifyOptions: this.linkifyOptions,
            })
          ];
        }
      }

      // Error panel
      if (
        log.data.every((message) => typeof message === 'string') &&
        log.method === 'error'
      ) {
        return h(ErrorPanel, { error: log.data.join('\n') });
      }

      // Normal inspector
      const quoted = typeof log.data[0] !== 'string';
      return h(ObjectTree, {
        log,
        quoted,
        linkifyOptions: this.linkifyOptions
      });
    },
    typeCheck(log) {
      if (!log) {
        return h(Formatted, {
          data: [
            `%c[console] %cFailed to parse message! %clog was typeof ${typeof log}, but it should've been a log object`,
            'color: red',
            'color: orange',
            'color: cyan',
          ]
        });

      } else if (!(log.data instanceof Array)) {
        return h(Formatted, { 
          data: [
            '%c[console] %cFailed to parse message! %clog.data was not an array!',
            'color: red',
            'color: orange',
            'color: cyan',
          ]
        });
      }
      return false;
    },
  },
  render() {
    return h('div', { class: 'message-content' }, this.getNode());
  }
};