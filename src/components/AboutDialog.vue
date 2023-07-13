<template>
  <Modal v-model="isShown" footer-hide scrollable width="30em">
    <template #header>
      <div class="header-tabs">
        <button type="button" :class="{ 'active': showAbout }" @click="handleAboutClick">About</button>
        <button type="button" :class="{ 'active': showCredits }" @click="handleCreditsClick">Credits</button>
        <button type="button" :class="{ 'active': showLicense }" @click="handleLicenseClick">License</button>
      </div>
    </template>

    <div class="content">
      <img class="logo" src="/vite.svg" alt="Logo" />
      <h3>Run Js</h3>
      <div :class="{ 'about-panel': true, 'show': showAbout }">
        <div class="version">1.0.0</div>
        <p>Develop by <a href="https://soeminnminn.github.io">Soe Minn Minn</a></p>
        <p>Copyright © 2023 The Open Source Project</p>
      </div>
      <div :class="{ 'credits-panel': true, 'show': showCredits }">
        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
      </div>
      <div :class="{ 'license-panel': true, 'show': showLicense }">
        <p>Licensed under the Apache License, Version 2.0 (the "License");<br/>you may not use this file except in compliance with the License.<br/>You may obtain a copy of the License at</p>
        <a href="http://www.apache.org/licenses/LICENSE-2.0">http://www.apache.org/licenses/LICENSE-2.0</a>
        <p>Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.</p>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.header-tabs {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
}
.header-tabs button {
  background-color: var(--dim-background-color);
  color: var(--foreground-color);
  border-radius: 0;
  border: 1px solid var(--border-color);
  user-select: none;
  outline: none!important;
  padding: 0.475em 1em;
  font-size: small;
  font-weight: 500;
  font-family: inherit;
  cursor: pointer;
}
.header-tabs :first-child {
  border-top-left-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
  border-right: 0!important;
}
.header-tabs :last-child {
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
  border-left: 0!important;
}
.header-tabs button.active, .header-tabs button:active {
  background-color: var(--hover-color);
  color: var(--menu-on-secondary);
  border-color: var(--link-color);
}
.header-tabs button.active {
  pointer-events: none;
}

.content {
  display: flex;
  flex-flow: column;
  align-items: center;
  position: relative;
  height: 15.75rem;
  color: var(--foreground-color);
}

.content a {
  font-weight: 500;
  color: var(--link-color);
  text-decoration: inherit;
}

.content a:hover {
  color: var(--hover-color);
}

.content .logo {
  min-height: 5.25rem;
}
.about-panel {
  display: none;
  flex-flow: column;
  align-items: center;
}
.about-panel .version {
  margin-bottom: 1rem;
}
.about-panel p {
  text-align: center;
  font-size: small;
  margin-top: 0.375rem;
  margin-bottom: 0.375rem;
}

.credits-panel, .license-panel {
  display: none;
  font-size: small;
  flex-flow: column;
  max-height: 6.5rem;
  overflow-y: auto;
  border: 1px solid var(--border-color);
  padding: 0.5rem;
  scrollbar-width: thin;
}
.credits-panel::-webkit-scrollbar, .license-panel::-webkit-scrollbar {
  width: 0.6rem;
  height: 0.6rem;
  background-color: rgba(0, 0, 0, 0.06);
}
.credits-panel::-webkit-scrollbar-thumb, .license-panel::-webkit-scrollbar-thumb {
  background: #bbb;
}
.credits-panel::-webkit-scrollbar-thumb:hover, .license-panel::-webkit-scrollbar-thumb:hover {
  background: #a0a0a0;
}
.credits-panel::-webkit-scrollbar-thumb:active, .license-panel::-webkit-scrollbar-thumb:active {
  background: #606060;
}
.credits-panel p, .license-panel p {
  text-align: left;
  font-size: small;
}
.credits-panel p:first-child, .license-panel p:first-child {
  margin-top: 0.2rem;
}
.credits-panel p:last-child, .license-panel p:last-child {
  margin-bottom: 0.2rem;
}

.show {
  display: inline-flex;
}
</style>

<script>
import Modal from '../lib/components/Modal.vue';

export default {
  name: 'about-dialog',
  components: {
    Modal
  },
  data() {
    return {
      isShown: false,
      showCredits: false,
      showLicense: false
    };
  },
  computed: {
    showAbout() {
      return !this.showCredits && !this.showLicense;
    }
  },
  methods: {
    handleAboutClick(e) {
      this.showCredits = false;
      this.showLicense = false;
    },
    handleCreditsClick(e) {
      this.showCredits = true;
      this.showLicense = false;
    },
    handleLicenseClick(e) {
      this.showCredits = false;
      this.showLicense = true;
    },
    show() {
      this.isShown = true;
    },
    hide() {
      this.isShown = false;
    }
  }
}
</script>