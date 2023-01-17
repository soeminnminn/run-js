import { defineComponent, h } from 'vue';

import { shouldInline } from './shouldInline.js';

const OpenTag = defineComponent({
  name: 'OpenTag',
  props: {
    tagName: {
      type: String,
      required: false,
    },
    attributes: {
      default: []
    }
  },
  render() {
    const attributeNodes = [];
    if (this.attributes) {
      for (let i = 0; i < this.attributes.length; i++) {
        const attribute = this.attributes[i];

        attributeNodes.push(h('span', { key: i }, [
          ' ',
          h('span', { class: 'html-attribute-name' }, attribute.name),
          '="',
          h('span', { class: 'html-attribute-value' }, attribute.value),
          '"'
        ]));
      }
    }

    return h('span', { class: 'html-open-tag' }, [
      '<',
      h('span', { class: 'tag-name' }, this.tagName),
      ...attributeNodes,
      '>'
    ]);
  }
});

const CloseTag = defineComponent({
  name: 'CloseTag',
  props: {
    tagName: {
      type: String,
      required: false,
    },
    isChildNode: {
      type: Boolean,
      default: false
    }
  },
  render() {
    return h('span', {
      class: [
        'html-close-tag',
        {
          'offset-left': this.isChildNode
        }
      ]
    }, [
      '</',
      h('span', { class: 'tag-name' }, this.tagName),
      '>'
    ]);
  }
});

const nameByNodeType = {
  1: 'ELEMENT_NODE',
  3: 'TEXT_NODE',
  7: 'PROCESSING_INSTRUCTION_NODE',
  8: 'COMMENT_NODE',
  9: 'DOCUMENT_NODE',
  10: 'DOCUMENT_TYPE_NODE', // http://stackoverflow.com/questions/6088972/get-doctype-of-an-html-as-string-with-javascript
  11: 'DOCUMENT_FRAGMENT_NODE',
};

export default {
  name: 'DOMNodePreview',
  components: {
    OpenTag,
    CloseTag
  },
  props: {
    name: {
      required: false,
    },
    isCloseTag: {
      type: Boolean,
      default: false
    },
    data: {
      required: true,
    },
    expanded: {
      type: Boolean,
      default: false
    },
  },
  render() {
    const data = this.data;

    if (this.isCloseTag) {
      return h(CloseTag, { tagName: data.tagName, isChildNode: true });  
    }
    
    switch (data.nodeType) {
      case Node.ELEMENT_NODE:
        return h('span', null, [
          h(OpenTag, { tagName: data.tagName, attributes: data.attributes }),
          shouldInline(data) ? data.textContent : !this.expanded && '…',
          !this.expanded && h(CloseTag, { tagName: data.tagName })
        ]);

      case Node.TEXT_NODE:
        return h('span', null, data.textContent);

      case Node.CDATA_SECTION_NODE:
        return h('span', null, '<![CDATA[' + data.textContent + ']]>');

      case Node.COMMENT_NODE:
        return h('span', { class: 'html-comment' }, [
          '<!--',
          data.textContent,
          '-->'
        ]);

      case Node.PROCESSING_INSTRUCTION_NODE:
        return h('span', null, data.nodeName);

      case Node.DOCUMENT_TYPE_NODE:
        return h('span', { class: 'html-doctype' }, [
          '<!DOCTYPE ',
          data.name,
          data.publicId ? ` PUBLIC "${data.publicId}"` : '',
          !data.publicId && data.systemId ? ' SYSTEM' : '',
          data.systemId ? ` "${data.systemId}"` : '',
          '>'
        ]);

      case Node.DOCUMENT_NODE:
        return h('span', null, data.nodeName);

      case Node.DOCUMENT_FRAGMENT_NODE:
        return h('span', null, data.nodeName);

      default:
        return h('span', null, nameByNodeType[data.nodeType]);
    }
  }
};