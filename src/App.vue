<template>
  <nav class="navbar">
    <div class="container-fluid">
      <div class="navbar-brand">
        <img src="./assets/logo.svg" class="navbar-logo" alt="Vue logo" />
        <MenuDropdown v-if="multiDoc" :show-arrow="false">
          <Hamburger :toggle="false" />
          <template #menu>
            <MenuGroup>
              <MenuItem shortcuts="Ctrl+N"><img class="icon" src="/icons/new-file.svg" alt=""/>New</MenuItem>
              <MenuItem shortcuts="Ctrl+O"><img class="icon" src="/icons/open-folder.svg" alt=""/>Open</MenuItem>
            </MenuGroup>
            <MenuGroup>
              <MenuItem shortcuts="Ctrl+X"><img class="icon" src="/icons/cut.svg" alt=""/>Cut</MenuItem>
              <MenuItem shortcuts="Ctrl+C"><img class="icon" src="/icons/copy.svg" alt=""/>Copy</MenuItem>
              <MenuItem shortcuts="Ctrl+V"><img class="icon" src="/icons/paste.svg" alt=""/>Paste</MenuItem>
              <MenuItem shortcuts="Ctrl+F"><img class="icon" src="/icons/find.svg" alt=""/>Find</MenuItem>
              <MenuItem shortcuts="Ctrl+H"><img class="icon" src="/icons/replace.svg" alt=""/>Replace</MenuItem>
            </MenuGroup>
            <MenuGroup>
              <MenuItem shortcuts="Ctrl+Enter"><img class="icon" src="/icons/run.svg" alt=""/>Run</MenuItem>
              <MenuItem shortcuts="F1"><img class="icon" src="/icons/command-palette.svg" alt=""/>Command palette…</MenuItem>
            </MenuGroup>
            <MenuGroup>
              <MenuItem no-icon>
                View
                <SubMenuGroup>
                  <MenuItem checkable checked>Output</MenuItem>
                  <MenuItem checkable>Terminal</MenuItem>
                  <MenuItem checkable>Browser</MenuItem>
                </SubMenuGroup>
              </MenuItem>
              <MenuItem disabled><img class="icon" src="/icons/settings.svg" alt=""/>Options…</MenuItem>
            </MenuGroup>
            <MenuGroup>
              <MenuItem><img class="icon" src="/icons/help.svg" alt=""/>About…</MenuItem>
            </MenuGroup>
          </template>
        </MenuDropdown>
      </div>
      <div v-if="multiDoc" class="navbar-tabs">
        <Tab :bottom-border="false">
          <TabItem selected><img class="icon" src="/icons/file-dark.svg" alt="" />Untitled 0</TabItem>
          <TabAdd />
        </Tab>
      </div>
      <div class="navbar-actions">
        <Button :small="true" variant="success" :loading="isRunning" @click="onRunClick"><img class="icon" src="/icons/run.svg" alt=""/>Run</Button>
      </div>
    </div>
  </nav>
  <div class="container">
    <SplitPanes class="dark-theme" :horizontal="true">
      <Pane min-size="20" size="80">
        <monaco-editor v-model="code" height="100%" theme='vs-dark' defaultLanguage="javascript"></monaco-editor>
      </Pane>
      <Pane min-size="20">
        <div class="panel-header">
          <span>Output</span>
        </div>
        <OutputArea ref="output" :command-input="false" />
      </Pane>
    </SplitPanes>
  </div>
</template>

<style scoped>
.navbar {
  position: relative;
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  padding: 0 0.25rem 0 0.25rem;
  justify-content: flex-start;
  height: 2.5rem;
  background-color: #303030;
  border-bottom: 2px solid #404040;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
}
.navbar-brand {
  display: flex;
  font-weight: 400;
  font-size: 1rem;
  line-height: 1.5;
  padding-bottom: 0.3125rem;
  padding-top: 0.3125rem;
  text-align: start;
  text-decoration: none;
  white-space: nowrap;
}
.navbar-brand > :deep(*) {
  margin-right: 0.5rem;
}
.navbar-logo {
  width: 1.825rem;
  height: 1.825rem;
}
.navbar-text {
  font-weight: 600;
  text-transform: uppercase;
  padding-top: 0.125rem;
}
.navbar-tabs {
  flex: auto;
  margin-bottom: -0.25rem;
}
.navbar-actions {
  display: flex;
}
.container, .container-fluid {
  width: 100%;
  padding-right: 0.25rem;
  padding-left: 0.25rem;
  margin-right: auto;
  margin-left: auto;
}

.navbar > .container-fluid {
  display: flex;
  flex-wrap: inherit;
  align-items: center;
  justify-content: space-between;
}

.container {
  height: calc(100vh - 2.5rem);
}
.panel-header {
  padding: 0 1rem 0.25rem 1rem;
  background-color: #2e2e2e;
  border-top: 1px solid #404040;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
  font-weight: 600;
  font-size: small;
}
</style>

<script>
import SplitPanes, { Pane } from './lib/components/SplitPanes.vue';
import Button from './lib/components/BsButton.vue';
import Hamburger from './lib/components/ToggleHamburger.vue';
import { MenuDropdown, MenuGroup, MenuItem, SubMenuGroup } from './lib/components/Menu.vue';
import Tab, { TabItem, TabAdd } from './lib/components/Tab.vue';
import OutputArea from './components/OutputArea.vue';
import executer from './lib/executer';

export default {
  name: 'App',
  components: {
    SplitPanes,
    Pane,
    Hamburger,
    Button,
    MenuDropdown,
    MenuGroup, 
    MenuItem, 
    SubMenuGroup,
    Tab,
    TabItem,
    TabAdd,
    OutputArea
  },
  data() {
    return {
      isRunning: false,
      code: '',
      multiDoc: false
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
      await executer.run(this.code, this.console);
      setTimeout(() => {
        this.isRunning = false;
      }, 3000);
    },
  },
}
</script>