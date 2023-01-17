import { defineComponent, h } from 'vue';

import DOMNodePreview from './DOMNodePreview.js';
import TreeView from '../tree-view/TreeView.vue';

import { shouldInline } from './shouldInline.js';

const domIterator = function* (data) {
  if (data && data.childNodes) {
    const textInlined = shouldInline(data);

    if (textInlined) {
      return;
    }

    for (let i = 0; i < data.childNodes.length; i++) {
      const node = data.childNodes[i];

      if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length === 0) continue;

      yield {
        name: `${node.tagName}[${i}]`,
        data: node,
      };
    }

    // at least 1 child node
    if (data.tagName) {
      yield {
        name: 'CLOSE_TAG',
        data: {
          tagName: data.tagName,
        },
        isCloseTag: true,
      };
    }
  }
};

export default {
  name: 'DOMNodePreview',
  components: {
    TreeView,
    DOMNodePreview
  },
  props: {
    name: {
      required: false,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  render() {
    const nodeRenderer = this.$slots.default || ((props) => {
      return h(DOMNodePreview, props);
    });
    
    return h('div', { class: 'dom-node-preview' }, 
      h(TreeView, {
        name: this.name,
        data: this.data,
        dataIterator: domIterator,
      }, {
        default: nodeRenderer
      })
    );
  }
};