<template>
  <Modal v-model="isShown" width="30em">
    <template #header>
      <div class="dialog-title">Settings</div>
    </template>
    <div class="option-content">
      <div class="option-group">
        <h4 class="group-header">Appearance</h4>
        <div class="options">
          <div class="head-label">Color scheme</div>
          <div class="color-scheme">
            <label for="appr-auto" class="appr-auto">
              <div class="img" src="/web-appearance-light.svg" alt="Auto" />
              <input type="radio" id="appr-auto" value="auto" v-model="appearance" />
              <span>Automatic</span>
            </label>
            
            <label for="appr-light" class="appr-light">
              <div class="img" src="/web-appearance-light.svg" alt="Light" />
              <input type="radio" id="appr-light" value="light" v-model="appearance" />
              <span>Light</span>
            </label>
            
            <label for="appr-dark" class="appr-dark">
              <div class="img" src="/web-appearance-dark.svg" alt="Dark" />
              <input type="radio" id="appr-dark" value="dark" v-model="appearance" />
              <span>Dark</span>
            </label>
          </div>
        </div>
      </div>
      <div class="option-group">
        <h4 class="group-header">Editor</h4>
        <div class="options">
          <ToggleSwitch label="Enable Minimap" v-model="enabledMinimap" />
          <ToggleSwitch label="Enable Mouse Wheel Zoom" v-model="mouseWheelZoom" />
          <ToggleSwitch label="Enable Word-wrap" v-model="wordWrap" />
          <ToggleSwitch label="Enable Folding" v-model="folding" />
        </div>
      </div>
      <div class="option-group">
        <h4 class="group-header">Output</h4>
        <div class="options">
          <ToggleSwitch label="Show Line" v-model="showLine" />
          <ToggleSwitch label="Show Timestamp" v-model="showTimestamp" />
          <ToggleSwitch label="Show Command Input" v-model="showCommandInput" />
        </div>
      </div>
    </div>
    <template #footer>
      <Button variant="primary" @click="handleAcceptClick">Ok</Button>
      <Button modal-close variant="outline-primary">Cancel</Button>
    </template>
  </Modal>
</template>

<style scoped>
.dialog-title {
  color: var(--foreground-color);
}
.option-content {
  margin: 0;
  margin-bottom: 1rem;
  padding: 0;
  color: var(--foreground-color);
}
.option-group .group-header {
  display: block;
  width: 100%;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.option-group .head-label {
  display: block;
  width: 100%;
  flex: none;
  font-size: small;
  font-weight: 700;
  padding: 0.375em 0;
}
.option-group .options {
  display: flex;
  flex-flow: column;
  font-size: small;
  gap: 0.25rem;
  margin: 0 1em;
}
.color-scheme {
  display: inline-flex;
  width: 100%;
  gap: 0.45em;
}

.color-scheme label {
  position: relative;
  display: inline-flex;
  flex-flow: column;
  align-items: flex-start;
  position: relative;
  border: 1px solid var(--border-color);
  border-radius: 0.275em;
  padding: 0;
  background-color: var(--dim-background-color);
  font-size: small;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
}

.color-scheme label:hover {
  background-color: var(--menu-dim-foreground-inverse);
}

.color-scheme label .img {
  display: inline-block;
  width: 5.215em;
  height: 4em;
  margin: .325em 2.75em;
  border: 1px solid var(--border-color);
  border-radius: 0.275em;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.color-scheme label.appr-auto .img {
  background: url(/web-appearance-light.svg);
}
@media (prefers-color-scheme: dark) {
  .color-scheme label.appr-auto .img {
    background: url(/web-appearance-dark.svg);
  } 
}

.color-scheme label.appr-light .img {
  background: url(/web-appearance-light.svg);
}

.color-scheme label.appr-dark .img {
  background: url(/web-appearance-dark.svg);
}

.color-scheme label input {
  flex: none;
  position: absolute;
  bottom: .6em;
  left: .5em;
}

.color-scheme label span {
  display: block;
  padding-left: 2.75em;
  width: 100%;
  line-height: 2.25em;
  border-top: 1px solid var(--border-color);
  background: var(--background-color);
}
</style>

<script>
import Modal from '../lib/components/Modal.vue';
import ToggleSwitch from '../lib/components/ToggleSwitch.vue';
import Button from '../lib/components/BsButton.vue';

export default {
  name: 'settings-dialog',
  components: {
    Modal,
    ToggleSwitch,
    Button
  },
  props: {
    modelValue: {
      type: Object,
      default: {}
    },
  },
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
  emits: [ 'update:modelValue' ],
  data() {
    const config = this.modelValue;
    return {
      appearance: config.appearance,
      enabledMinimap: config.editor.enabledMinimap,
      mouseWheelZoom: config.editor.mouseWheelZoom,
      wordWrap: config.editor.wordWrap,
      folding: config.editor.folding,
      showLine: config.output.showLine,
      showTimestamp: config.output.showTimestamp,
      showCommandInput: config.output.showCommandInput,
      isShown: false,
    };
  },
  methods: {
    handleAcceptClick(e) {
      const config = {
        appearance: this.appearance,
        editor: {
          enabledMinimap: this.enabledMinimap,
          mouseWheelZoom: this.mouseWheelZoom,
          wordWrap: this.wordWrap,
          folding: this.folding,
        },
        output: {
          showLine: this.showLine,
          showTimestamp: this.showTimestamp,
          showCommandInput: this.showCommandInput
        },
      };
      this.value = config;
      this.hide();
    },
    show() {
      this.isShown = true;
    },
    hide() {
      this.isShown = false;
    },
  }
}
</script>