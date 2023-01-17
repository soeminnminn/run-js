import { h, normalizeStyle } from 'vue';

function uniqueId(length = 10) {
  let generated = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    generated += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return generated;
};

export default {
  name: 'Pane',
  inject: ['requestUpdate', 'onPaneAdd', 'onPaneRemove', 'onPaneClick'],
  emits: [
    'update:modelValue',
    'resize',
  ],
  props: {
    size: { type: [Number, String], default: null },
    minSize: { type: [Number, String], default: 0 },
    maxSize: { type: [Number, String], default: 100 }
  },
  data: () => ({
    style: {},
    uid: uniqueId(),
  }),
  mounted() {
    this.onPaneAdd(this)
  },
  beforeUnmount() {
    this.onPaneRemove(this)
  },
  methods: {
    // Called from the splitpanes component.
    update(style) {
      this.style = style;
      this.$emit('update:modelValue', style);
      this.$emit('resize', style);
    }
  },
  computed: {
    sizeNumber() {
      return (this.size || this.size === 0) ? parseFloat(this.size) : null
    },
    minSizeNumber() {
      return parseFloat(this.minSize)
    },
    maxSizeNumber() {
      return parseFloat(this.maxSize)
    }
  },
  watch: {
    sizeNumber(size) {
      this.requestUpdate({ target: this, size })
    },
    minSizeNumber(min) {
      this.requestUpdate({ target: this, min })
    },
    maxSizeNumber(max) {
      this.requestUpdate({ target: this, max })
    }
  },
  render() {
    return h(
      'div', {
        class: 'splitpanes__pane',
        onClick: (e) => this.onPaneClick(e, this.id),
        style: normalizeStyle(this.style),
      }, this.$slots.default({}));
  },
};