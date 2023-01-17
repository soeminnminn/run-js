<template>
  <div :class="{
    'vjs-tree-node': true,
    'has-carets': showIcon,
  }" @click="handleNodeClick" :style="style">

    <span v-if="showLineNumber" class="vjs-node-index">{{ node.id + 1 }}</span>
  
    <div class="vjs-indent">
      <template v-for="(item, index) in Array.from(Array(node.level))" :key="index">
        <div :class="{
          'vjs-indent-unit': true,
          'has-line': showLine,
        }" />
      </template>

      <span v-if="(showIcon && !!~['objectStart', 'arrayStart', 'objectCollapsed', 'arrayCollapsed'].indexOf(node.type))" :class="{
        'vjs-carets': true,
        'close': collapsed,
      }" @click="handleIconClick" />
    </div>

    <span v-if="node.key" class="vjs-key">
      {{ renderKey() }}
    </span>

    <span>
      <span v-if="(node.type !== 'content' && node.content)" :class="{
        'vjs-tree-brackets': true,
        'brackets-clickable': collapsedOnClickBrackets
      }" @click="handleBracketsClick">
        {{ node.content }}
      </span>
      <span v-else :class="(`vjs-value vjs-value-${dataType}`)">
        {{ renderValue() }}
      </span>

      <span v-if="node.showComma">{{ ',' }}</span>

      <span v-if="(showLength && collapsed)" class="vjs-comment">{{ ` // ${node.length} items ` }}</span>
    </span>
  </div>
</template>

<script>
import { getDataType } from './utils';

// The props here will be exposed to the user through the topmost component.
export const treeNodePropsPass = {
  // Whether to display the length of (array|object).
  showLength: {
    type: Boolean,
    default: true,
  },
  // Whether the key name uses double quotes.
  showDoubleQuotes: {
    type: Boolean,
    default: true,
  },
  // Custom render for key.
  renderNodeKey: Function,
  // Custom render for value.
  renderNodeValue: Function,
  // Whether to display the data level connection.
  showLine: {
    type: Boolean,
    default: true,
  },
  showLineNumber: {
    type: Boolean,
    default: true,
  },
  showIcon: {
    type: Boolean,
    default: true,
  },
  // Collapsed control.
  collapsedOnClickBrackets: {
    type: Boolean,
    default: true,
  },
};

export default {
  name: "TreeNode",
  props: {
    ...treeNodePropsPass,
    // Current node data.
    node: {
      type: Object,
      required: true,
    },
    // Whether the current node is collapsed.
    collapsed: Boolean,
    style: Object,
  },
  emits: ['nodeClick', 'bracketsClick', 'iconClick'],
  computed: {
    dataType() {
      return getDataType(this.node.content);
    },
    defaultKey() {
      const key = this.node.key || '';
      return this.showDoubleQuotes ? `"${key}":` : `${key}:`;
    },
    defaultValue() {
      let value = this.node && this.node.content;
      if (value === null) {
        value = 'null';
      } else if (value === undefined) {
        value = 'undefined';
      }
      return this.dataType === 'string' ? `"${value}"` : value + '';
    },
  },
  methods: {
    renderKey() {
      const render = this.renderNodeKey;

      return render
        ? render({ node: this.node, defaultKey: this.defaultKey })
        : this.defaultKey;
    },
    renderValue() {
      const render = this.renderNodeValue;

      return render
        ? render({ node: this.node, defaultValue: this.defaultValue })
        : this.defaultValue;
    },
    handleBracketsClick() {
      this.$emit('bracketsClick', !this.collapsed, this.node.path);
    },
    handleIconClick() {
      this.$emit('iconClick', !this.collapsed, this.node.path);
    },
    handleNodeClick() {
      this.$emit('nodeClick', this.node);
    },
  },
};
</script>