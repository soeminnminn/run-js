<script>
export const COLOR_SCHEME = {
  AUTO: 'auto',
  LIGHT: 'light',
  DARK: 'dark'
};

const schemes = [COLOR_SCHEME.AUTO, COLOR_SCHEME.LIGHT, COLOR_SCHEME.DARK];

export default {
  name: 'color-scheme-provider',
  props: {
    modelValue: {
      type: String,
      default: COLOR_SCHEME.LIGHT,
    },
    useSystem: {
      type: Boolean,
      default: false
    },
    fireCustomEvent: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      schemeMedia: null,
      prefersScheme: null,
    };
  },
  emits: [ 'update:modelValue', 'change' ],
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    },
  },
  watch: {
    useSystem(value) {
      if (value == true) {
        this.value = this.prefersScheme;
      }
    }
  },
  provide() {
    return {
      setColorScheme: (scheme) => {
        if (!schemes.includes(scheme)) return;
        
        if (!this.useSystem) {
          this.value = scheme;
        }
        this.$emit('change', { scheme, prefersScheme: this.prefersScheme });
      },
      getColorScheme: () => this.value,
      getPrefersColorScheme: () => this.prefersScheme,
    };
  },
  mounted() {
    if ('matchMedia' in window && typeof window.matchMedia === 'function') {
      this.schemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
      this.schemeMedia.addEventListener('change', this.onSchemeChanged);

      this.onSchemeChanged(this.schemeMedia);
    }
  },
  beforeUnmount() {
    if (this.schemeMedia) {
      this.schemeMedia.removeEventListener('change', this.onSchemeChanged);
    }
  },
  render() {
    return this.$slots.default();
  },
  methods: {
    onSchemeChanged(e) {
      this.prefersScheme = e.matches ? COLOR_SCHEME.DARK : COLOR_SCHEME.LIGHT;

      if (this.useSystem) {
        this.value = this.prefersScheme;
      }
      
      const evArgs = { scheme: this.value, prefersScheme: this.prefersScheme  };
      this.$emit('change', { ...evArgs, event: e });

      if (this.fireCustomEvent) {
        const ev = new CustomEvent('schemechange', { detail: evArgs });
        document.dispatchEvent(ev);
      }
    },
  }
}
</script>