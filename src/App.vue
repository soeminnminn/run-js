<template>
<nav class="navbar">
    <div class="container-fluid">
      <div class="navbar-brand">
        <img src="./assets/logo.svg" class="navbar-logo" alt="Logo" />
      </div>
      <div v-if="multiDoc" class="navbar-tabs">
        <Tab :bottom-border="false">
          <TabItem selected><img class="icon" src="/icons/file-dark.svg" alt="" />Untitled 0</TabItem>
          <TabAdd />
        </Tab>
      </div>
      <div class="navbar-actions">
        <Button :small="true" variant="success" :loading="isRunning" :disabled="(!code)" @click="onRunClick"><img class="icon" src="/icons/run.svg" alt=""/>Run</Button>
      </div>
    </div>
  </nav>
  <div class="container">
    <SplitPanes class="dark-theme" :horizontal="true">
      <Pane min-size="20" size="80">
        <MonacoEditor v-model="code" height="100%" theme='vs-dark' defaultLanguage="javascript" />
      </Pane>
      <Pane min-size="20">
        <div class="panel-header">
          <span>Output</span>
        </div>
        <OutputConsole ref="output" :command-input="false" />
      </Pane>
    </SplitPanes>
  </div>
</template>

<script>
import Button from './components/BsButton.vue';
import MonacoEditor from './components/MonacoEditor.vue';
import { SplitPanes, Pane } from './lib/split-panes';
import { Tab, TabItem, TabAdd } from './lib/nav-tab';
import { OutputConsole } from './lib/output-console';
import executer from './lib/executer';

export default {
  name: 'App',
  components: {
    Button,
    Pane, SplitPanes,
    MonacoEditor,
    Tab, TabItem, TabAdd,
    OutputConsole
  },
  data() {
    return {
      isRunning: false,
      code: '',
      multiDoc: true
    };
  },
  computed: {
    console() {
      if (this.$refs.output) {
        return this.$refs.output.console;
      }
      return window.console;
    }
  },
  methods: {
    async onRunClick(ev) {
      this.isRunning = true;
      
      try {
        await executer.run(this.code, this.console);
      } catch(e) {
        this.console.error(e);
      }
      
      setTimeout(() => {
        this.isRunning = false;
      }, 1000);
    },
  },
};
</script>