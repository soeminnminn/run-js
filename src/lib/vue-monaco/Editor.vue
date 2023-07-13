<template>
  <div class="editor-wrapper" :style="{ width, height }">
    <div v-if="!isEditorReady" class="loading">
      <Loading />
    </div>
    <div ref="containerRef" class="editor-container" :class="{ 'hide': !isEditorReady }"></div>
  </div>
</template>

<style scoped>
.editor-wrapper {
  display: flex;
  position: relative;
  text-align: initial;
}

.editor-wrapper .editor-container {
  width: 100%;
}
.editor-wrapper .editor-container.hide {
  display: none;
}

.editor-wrapper .loading {
  display: flex;
  height: 100%;
  width: 100%;
  justify-content: center;
  align-items: center;
}
</style>

<script>
import { ref, shallowRef } from 'vue';
import loader from './loader';
import Loading from './Loading.vue';
import * as monaco from 'monaco-editor';

export function getOrCreateModel(monacoNs, value, language, path) {
  return  monacoNs.editor.getModel(monacoNs.Uri.parse(path)) || 
          monacoNs.editor.createModel(value, language, path ? 
          monacoNs.Uri.parse(path) : undefined);
}

export default {
  name: 'Editor',
  components: {
    Loading
  },
  props: {
    defaultValue: {
      type: String,
      default: ''
    },
    defaultPath: {
      type: String
    },
    defaultLanguage: {
      type: String
    },
    modelValue: {
      type: String
    },
    language: {
      type: String
    },
    path: {
      type: String
    },
    theme: {
      type: String,
      default: 'light',
    },
    options: {
      type: Object,
      default: () => ({}),
    },
    overrideServices: {
      type: Object,
      default: () => ({}),
    },
    saveViewState: {
      type: Boolean,
      default: true,
    },
    width: {
      type: [Number, String],
      default: '100%',
    },
    height: {
      type: [Number, String],
      default: '100%',
    },
  },
  emits: [
    'editorCreated',
    'update:modelValue',
    'change',
    'validate'
  ],
  setup() {
    loader.config({ monaco });
  },
  data() {
    return {
      monacoLoader: null,
      viewStates: new Map(),
      editorRef: null,
      monacoRef: null,
      disposeValidator: null,
    }
  },
  computed: {
    isEditorReady() {
      return !!(this.editorRef);
    },
  },
  watch: {
    options: {
      handler() {
        if (this.editorRef) {
          this.editorRef.updateOptions(options);
        }
      },
      deep: true,
    },
    modelValue(newValue) {
      if (this.editorRef && this.editorRef.getValue() !== newValue) {
        this.editorRef.setValue(newValue);
      }
    },
    path(newPath, oldPath) {
      const model = getOrCreateModel(
        this.monacoRef,
        this.modelValue || this.defaultValue,
        this.language || this.defaultLanguage,
        newPath,
      );
      if (model !== this.editorRef.getModel()) {
        this.saveViewState && this.viewStates.set(oldPath, this.editorRef.saveViewState());
        this.editorRef.setModel(model);
        this.saveViewState && this.editorRef.restoreViewState(this.viewStates.get(newPath));
      }
    },
    theme(theme) {
      if (this.monacoRef) {
        this.monacoRef.editor.setTheme(theme);
      }
    },
    language(language) {
      if (this.isEditorReady) {
        this.monacoRef.editor.setModelLanguage(this.editorRef.getModel(), language);
      }
    },
    line(line) {
      if (this.editorRef && typeof(line) !== undefined) {
        this.editorRef.revealLine(line);
      }
    },
    monacoRef(monacoRef) {
      if (monacoRef) {
        this.createEditor();
      }
    },
    editorRef(editorRef) {
      if (editorRef) {
        const changeMarkersListener = monaco.editor.onDidChangeMarkers(uris => {
          const editorUri = editorRef.getModel()?.uri;
          if (editorUri) {
            const currentEditorHasMarkerChanges = uris.find(uri => uri.path === editorUri.path);
            if (currentEditorHasMarkerChanges) {
              const markers = monaco.editor.getModelMarkers({ resource: editorUri });
              this.$emit('validate', markers);
            }
          }
        });
        this.disposeValidator = ref(() => changeMarkersListener.dispose());
      }
    },
  },
  mounted() {
    this.$nextTick(this.init);
  },
  unmounted() {
    if (this.disposeValidator) {
      this.disposeValidator();
    }
    if (this.editorRef) {
      this.editorRef.getModel().dispose();
      if (this.editorRef.dispose) {
        this.editorRef.dispose();
      }
    }
  },
  methods: {
    async init() {
      try {
        const monacoLoader = loader.init();
        this.monacoLoader = ref(monacoLoader);
        
        const monacoInstance = await monacoLoader;
        this.monacoRef = shallowRef(monacoInstance);
      } catch(error) {
        if (error.type !== 'cancelation') {
          console.error('Monaco initialization error:', error);
        }
      }
    },
    createEditor() {
      const containerRef = this.$refs.containerRef;
      if (!containerRef || !this.monacoRef || this.editorRef) {
        return;
      }

      const autoCreatedModelPath = this.path || this.defaultPath;
      const defaultModel = getOrCreateModel(
        this.monacoRef,
        this.modelValue || this.defaultValue,
        this.language || this.defaultLanguage,
        autoCreatedModelPath,
      );
      
      const editor = monaco.editor.create(
        containerRef,
        {
          model: defaultModel,
          theme: this.theme,
          automaticLayout: true,
          autoIndent: 'brackets',
          formatOnPaste: true,
          formatOnType: true,
          ...this.options,
        },
        this.overrideServices,
      );
      
      editor.onDidChangeModelContent(event => {
        const value = editor.getValue();
        if (value !== this.modelValue) {
          this.$emit('update:modelValue', value);
          this.$emit('change', value, event);
        }
      });
      
      this.$emit('editorCreated', { monaco: this.monacoRef, editor });
      this.editorRef = shallowRef(editor);
    },
    setOption(key, value) {
      if (!key || typeof key !== 'string') return;

      const isArrayKey = (ak) => typeof ak === 'number' || (ak && /^[\d]+$/.test(ak));

      const keys = key.split('.');
      if (keys.length) {
        const fk = keys.shift();
        const fo = this.options[fk] || (isArrayKey(keys[0]) ? [] : {});
        
        let o = fo;
        while(keys.length) {
          const k = keys.shift();
          if (!keys.length) {
            o[k] = value;
          } else {
            o = o[k] || (isArrayKey(keys[0]) ? [] : {});
          }
        }

        this.options[fk] = fo;
      }
    },
    showCommandPalette() {
      const editor = this.editorRef;
      if (editor) {
        editor.focus();
        editor.trigger('', 'editor.action.quickCommand');
      }
    },
    formatDocument() {
      const editor = this.editorRef;
      if (editor) {
        editor.focus();
        editor.trigger('', 'editor.action.formatDocument');
      }
    }
  },
};
</script>
