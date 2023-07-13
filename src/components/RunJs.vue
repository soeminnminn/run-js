<template>
  <ColorSchemeProvider v-model="colorScheme" :use-system="useSystemScheme">
    <div :class="{'runjs-container': true, 'dark': colorScheme == 'dark'}">
      <nav class="navbar">
        <div class="container-fluid">
          <div class="navbar-brand">
            <Dropdown ref="navMenu">
              <img src="/logo.svg" class="navbar-logo" alt="Logo" />
              <template #dropdown>
                <ul class="nav-menu">
                  <li class="menu-item" :disabled="(!code ? true : undefined)" @click="onRunClick">
                    <div class="menu-header">Run code<span class="shortcuts">Ctrl+Enter</span></div>
                  </li>
                  <li class="menu-item" @click="onSettings">
                    <div class="menu-header">Settings…</div>
                  </li>
                  <li class="menu-separator"></li>
                  <li class="menu-item" @click="onAboutUs">
                    <div class="menu-header">About us…<span class="shortcuts">Ctrl+F1</span></div>
                  </li>
                </ul>
              </template>
            </Dropdown>
          </div>
          <div class="navbar-tabs">
          </div>
          <div class="navbar-actions">
            <Button :small="true" variant="success" :loading="isRunning" :disabled="(!code)" @click="onRunClick"><img class="icon" src="/icons/run.svg" alt=""/>Run</Button>
          </div>
        </div>
      </nav>
      <SplitPanes :horizontal="true">
        <Pane min-size="20" size="80">
          <Editor ref="editor" v-model="code" :theme="monacoTheme" height="100%" defaultLanguage="javascript" @editor-created="onEditorCreated" />
        </Pane>
        <Pane min-size="20">
          <div class="panel-header">
            <span>Output</span>
          </div>
          <OutputConsole ref="output" :command-input="outputConfig.showCommandInput" :show-line="outputConfig.showLine" :show-timestamp="outputConfig.showTimestamp" />
        </Pane>
      </SplitPanes>
      <SettingsDialog ref="settingsDialog" v-model="config" :color-scheme="colorScheme" />
      <AboutDialog ref="aboutDialog" :color-scheme="colorScheme" />
    </div>
  </ColorSchemeProvider>
</template>
  
<script>
import Button from '../lib/components/BsButton.vue';
import Editor from '../lib/vue-monaco/Editor.vue';
import { SplitPanes, Pane } from '../lib/split-panes';
import { OutputConsole } from '../lib/output-console';
import Dropdown from '../lib/components/Dropdown.vue';
import AboutDialog from './AboutDialog.vue';
import SettingsDialog from './SettingsDialog.vue';
import ColorSchemeProvider from '../lib/components/ColorSchemeProvider.vue';
import { useLocalStorage } from '../lib/use-storage';
import executer from '../lib/executer';

/*
minimap.enabled?: boolean;
mouseWheelZoom?: boolean;
wordWrap: boolean;
folding?: boolean;
*/
const defConfig = {
  appearance: 'auto',
  editor: {
    enabledMinimap: true,
    mouseWheelZoom: false,
    wordWrap: false,
    folding: true,
  },
  output: {
    showLine: true,
    showTimestamp: true,
    showCommandInput: false
  },
};

const configKey = 'run-js.config';

export default {
  name: 'run-js',
  components: {
    ColorSchemeProvider,
    Button,
    Pane, SplitPanes,
    Dropdown,
    Editor,
    OutputConsole,
    AboutDialog,
    SettingsDialog
  },
  data() {
    return {
      colorScheme: 'light',
      useSystemScheme: true,
      monacoTheme: 'vs',
      isRunning: false,
      code: '',
      config: defConfig,
    };
  },
  computed: {
    console() {
      if (this.$refs.output) {
        return this.$refs.output.console;
      }
      return window.console;
    },
    preventClose() {
      return this.isRunning || !!this.code;
    },
    outputConfig() {
      return {
        ...defConfig.output,
        ...(this.config.output || {}),
      };
    }
  },
  watch: {
    colorScheme(value) {
      if (value == 'light') {
        this.monacoTheme = 'vs';
      } else {
        this.monacoTheme = 'vs-dark';
      }
    },
    config: {
      handler(value) {
        this.useSystemScheme = value.appearance == 'auto'; 
        if (value.appearance != 'auto') {
          this.colorScheme = value.appearance;
        }
      },
      deep: true
    }
  },
  mounted() {
    this.config = useLocalStorage(configKey, defConfig);
    
    window.addEventListener('beforeunload', (event) => {
      if (this.preventClose) {
        event.returnValue = true;
        event.preventDefault();
      }
    });
  },
  methods: {
    onEditorCreated({ monaco, editor }) {
      const self = this;

      editor.addAction({
        id: 'runjs.execute',
        label: 'Run code',
        keybindings: [ monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter ],
        contextMenuGroupId: '9_runjs',
        contextMenuOrder: 1,
        run() {
          self.onRunClick();
        }
      });

      editor.addAction({
        id: 'runjs.settings',
        label: 'Settings…',
        contextMenuGroupId: '9_runjs',
        contextMenuOrder: 2,
        run() {
          self.onSettings();
        }
      });

      editor.addAction({
        id: 'runjs.about',
        label: 'About us…',
        keybindings: [ monaco.KeyMod.CtrlCmd | monaco.KeyCode.F1 ],
        contextMenuGroupId: '9_runjs',
        contextMenuOrder: 3,
        run() {
          self.onAboutUs();
        }
      });
    },
    async onRunClick(ev) {
      this.$refs.navMenu.close();
      this.isRunning = true;
      
      try {
        await executer.run(this.code, this.console);
      } catch(e) {
        this.console.error(e);
      }
      
      setTimeout(() => {
        this.isRunning = false;
      }, 500);
    },
    onSettings(ev) {
      this.$refs.navMenu.close();
      this.$refs.settingsDialog.show();
    },
    onAboutUs(ev) {
      this.$refs.navMenu.close();
      this.$refs.aboutDialog.show();
    },
  },
};
</script>