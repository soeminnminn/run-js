<template>
<div class="output-container" @click="handleClick">
  
  <template v-for="(msg, index) in messages" :key="index">
    <OutputRow :result="msg" />
  </template>

  <form v-if="commandInput" @submit.prevent="handleInputSubmit">
    <label class="message-input" for="outputEditInput">
      <input id="outputEditInput" ref="editInput" type="text" v-model="inputText" />
    </label>
  </form>

</div>
</template>

<style scoped lang="scss">
.output-container {
  display: block;
  width: 100%;
  height: 100%;
  background: rgb(30, 30, 30);
  overflow-x: hidden;
  overflow-y: auto;
  padding: 0.25rem;
  font-size: small;
}

.message-input {
  display: inline-block;
  width: 100%;
  padding-left: 2rem;
  padding-bottom: 2rem;
  position: relative;

  &::before {
    content: '';
    width: 18px;
    height: 18px;
    position: absolute;
    left: 0.5rem;
    margin-top: 4px;
    background-size: contain;
    scale: 0.8;
    background: transparent url("data:image/svg+xml,%3Csvg viewBox='0 0 21 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M10.051 16.267C9.84639 16.4821 9.74607 16.7607 9.75003 17.0392C9.75399 17.3177 9.86091 17.5936 10.0721 17.8035L10.088 17.8194C10.2965 18.0174 10.5632 18.1137 10.8285 18.1098C11.0939 18.1058 11.3579 18.0015 11.5612 17.7969C13.8924 15.4657 16.1985 13.0962 18.5152 10.7478C18.5245 10.7412 18.5324 10.7346 18.5403 10.7267C18.7449 10.5115 18.8452 10.2303 18.8413 9.95182C18.8373 9.67328 18.7291 9.39607 18.5179 9.18618L18.4822 9.15186C16.1761 6.83648 13.8726 4.51317 11.5598 2.20175C11.3579 1.99846 11.0939 1.89418 10.8285 1.89022C10.5632 1.88626 10.2965 1.98262 10.088 2.18195L10.0682 2.20175C9.86091 2.41032 9.75399 2.68489 9.75003 2.9621C9.74607 3.23932 9.84639 3.51917 10.051 3.73434L16.2843 9.97426L10.051 16.267ZM3.21706 16.003C3.01377 16.2168 2.91476 16.4953 2.91872 16.7726C2.92268 17.0511 3.02961 17.327 3.24082 17.5369L3.25666 17.5527C3.46391 17.7507 3.73188 17.8471 3.99721 17.8445C4.26254 17.8405 4.52788 17.7362 4.72984 17.5316C7.01223 15.2492 9.36985 13.0051 11.6826 10.7505C11.6918 10.7439 11.7011 10.7359 11.7103 10.728C11.9149 10.5128 12.0153 10.2317 12.0113 9.95314C12.0073 9.6746 11.8991 9.39739 11.6879 9.1875C9.37909 6.95 7.05843 4.72042 4.74437 2.48556L4.72852 2.4684C4.52656 2.26511 4.26254 2.16215 3.99721 2.15819C3.73188 2.15423 3.46523 2.25059 3.25666 2.4486L3.23686 2.4684C3.02961 2.67697 2.92268 2.95286 2.91872 3.22876C2.91476 3.50597 3.01509 3.78582 3.2197 4.00099L9.44774 9.97294L3.21706 16.003Z' fill='blue'/%3E%3C/svg%3E") no-repeat 50% 50%;
  }

  input {
    color: inherit;
    background: none;
    border: none;
    outline: none;
    width: 100%;
    line-height: inherit;
    font-size: inherit;
  }
}
</style>

<script>
import OutputRow from './OutputRow.vue';
import Console from '../lib/console';

const emptyCommands = ['clear', 'countReset', 'group', 'groupCollapsed', 'groupEnd', 'profile', 'profileEnd', 'timeStamp'];

export default {
  name: 'OutputArea',
  components: {
    OutputRow
  },
  props: {
    commandInput: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {
      consoleInst: null,
      messages: [ 
        { type: 'none', level: 0, messages: ['Welcome'] }
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
    write(cmd, ...args) {
      if (cmd == 'clear' || cmd.command == 'clear') {
        this.clear();

      } else if (!~emptyCommands.indexOf(cmd.command)) {
        const cmdType = !!~['error', 'warn', 'info'].indexOf(cmd.command) ? cmd.command : 'none';

        this.messages.push({ type: cmdType, ...cmd });
        this.updateScroll();
      }
    },
    clear() {
      this.messages = [{ type: 'none', text: 'Console was cleared.' }];
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
        this.messages.push({ type: 'command', level: 0, text: this.inputText });
        
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
};
</script>