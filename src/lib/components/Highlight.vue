<style lang="scss">
@import '~highlightjs/styles/vs2015.css';
</style>

<script>
import { h } from 'vue';
import hljs from 'highlight.js';
import javascript from 'highlight.js/lib/languages/javascript';
import json from 'highlight.js/lib/languages/json';

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('json', json);


function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

export default {
  name: 'Highlight',
  props: {
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      default: '',
    },
    autoDetect: {
      type: Boolean,
      default: true,
    },
    ignoreIllegals: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      currentLanguage: this.language,
    };
  },
  computed: {
    isAutoDetect() {
      return this.autoDetect && !this.language;
    },
    cannotDetectLanguage() {
      return !this.isAutoDetect && !hljs.getLanguage(this.language);
    },
    className() {
      if (this.cannotDetectLanguage) {
        return '';
      } else {
        return `hljs ${this.currentLanguage}`;
      }
    },
    highlightedCode() {
      if (this.cannotDetectLanguage) {
        console.warn(`The language "${this.currentLanguage}" you specified could not be found.`);
        return escapeHtml(this.code);
      }

      if (this.isAutoDetect) {
        const result = hljs.highlightAuto(this.code);
        this.currentLanguage = result.language ?? '';
        return result.value;

      } else {
        const result = hljs.highlight(this.code, {
          language: this.currentLanguage,
          ignoreIllegals: this.ignoreIllegals,
        });
        return result.value;
      }
    },
  },
  watch: {
    language(newLanguage) {
      this.currentLanguage = newLanguage;
    }
  },
  render() {
    return h('pre', {}, [
      h('code', {
        class: this.className,
        innerHTML: this.highlightedCode,
        tabindex: '0',
      }),
    ]);
  },
}
</script>