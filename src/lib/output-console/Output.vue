<template>
<div class="output-container" @click="handleClick">
  
  <template v-for="(msg, index) in messages" :key="index">
    <Message :log="msg" :log-limit="logLimit" :show-line="showLine" 
      :show-timestamp="showTimestamp" :linkify-options="linkifyOptions" />
  </template>

  <label v-if="commandInput" class="message-input" for="outputEditInput">
    <CommandInput id="outputEditInput" ref="editInput" type="text" v-model="inputText" @submit="handleInputSubmit" />
  </label>

</div>
</template>

<script>
import Message from './Message.vue';
import CommandInput from './CommandInput.vue'
import Console, { getTimestamp } from './console.js';

const emptyCommands = [
  'clear', 
  'countReset', 
  'group', 
  'groupCollapsed', 
  'groupEnd', 
  'profile', 
  'profileEnd', 
  'time'
];

export default {
  name: 'OutputConsole',
  components: {
    Message,
    CommandInput
  },
  props: {
    commandInput: {
      type: Boolean,
      default: true
    },
    logLimit: {
      type: Number,
      default: 100
    },
    showLine: {
      type: Boolean,
      default: true
    },
    showTimestamp: {
      type: Boolean,
      default: true
    },
    linkifyOptions: {
      type: Object,
      default: {}
    }
  },
  data() {
    return {
      consoleInst: null,
      messages: [ 
        { method: 'none', timestamp: getTimestamp(), level: 0, message: 'Welcome' }
      ],
      inputText: '',
    };
  },
  computed: {
    console() {
      if (!this.consoleInst) {
        this.consoleInst = new Console(this);
      }
      return this.consoleInst;
    },
  },
  methods: {
    write(cmd) {
      if (cmd == 'clear' || cmd.command == 'clear') {
        this.clear();

      } else if (!~emptyCommands.indexOf(cmd.command)) {
        let method = !!~['error', 'warn', 'info', 'table'].indexOf(cmd.command) ? cmd.command : 'none';

        this.messages.push({ method, ...cmd });
        this.updateScroll();
      }
    },
    clear() {
      this.messages = [{ method: 'none', timestamp: getTimestamp(), message: 'Console was cleared.' }];
    },
    execute(code) {
      try {
        const fn = new Function('console', code);
        const result = fn(this.console);
        if (result) {
          this.console.log(result);
        }
      } catch(e) {
        this.console.error(e);
      }
    },
    updateScroll() {
      const ele = this.$el;
      this.$nextTick(() => ele.scrollTo(0, ele.scrollHeight));
    },
    handleClick(e) {
      if (e.target == this.$el) {
        this.$refs.editInput.focus();
      }
    },
    handleInputSubmit(e) {
      if(this.inputText && this.inputText.length) {
        this.messages.push({ method: 'command', timestamp: getTimestamp(), level: 0, message: this.inputText });
        
        if (!!~['clear', 'clear()', 'clear();', 'cls'].indexOf(this.inputText)) {
          this.clear();
          this.inputText = '';
          return;  
        }

        this.execute(this.inputText);
        this.inputText = '';
      }
    },
  }
}
</script>