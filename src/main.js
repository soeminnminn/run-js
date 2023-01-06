import { createApp } from 'vue';

import monacoVue from './lib/monaco-vue';

import './style.css';

import App from './App.vue';
// import App from './TestApp.vue';

const app = createApp(App);

app.use(monacoVue);

app.mount('#app');
