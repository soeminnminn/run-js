<template>
  <div :class="[ 'message-log', log.method ]">

    <div v-if="showTimestamp" class="timestamp">
      <span>{{ log.timestamp || '' }}</span>
    </div>

    <div class="indent">
      <template v-for="(item, index) in Array.from(Array(log.level))" :key="index">
        <span :class="{
          'indent-unit': true,
          'has-line': showLine,
        }" />
      </template>
    </div>

    <MessageContent :log="combinedLog" :linkify-options="linkifyOptions" />

  </div>
</template>

<script>
import MessageContent from './MessageContent.js';

export default {
  name: 'Message',
  components: {
    MessageContent
  },
  props: {
    log: {
      type: Object,
      required: true
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
  computed: {
    combinedLog() {
      const log = this.log;
      let data = [];
      if (typeof log.message == 'string') {
        data.push(log.message);
      }
      
      if (log.data && log.data.length) {
        data = data.concat(log.data);
      }

      if(log.trace && Array.isArray(log.trace) && log.trace.length) {
        const trace = this.log.trace;
        data = data.concat(trace.map(x => `${x}`.trim().replace(/([^@]+)@(.)/, "$1 $2")));
      }

      return { ...log, data };
    }
  }
}
</script>