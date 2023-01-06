<template>
  <div :class="{
    'vjs-tree': true,
    'is-virtual': virtual,
    'has-line-number': showLineNumber,
  }" :style="{
    ...style
  }"
  @scroll="handleTreeScroll">
    
    <template v-if="virtual">
      <div class="vjs-tree-list" :style="{ height: `${height}px` }">
        <div class="vjs-tree-list-holder" :style="{ height: `${flatData.length * itemHeight}px` }">
          <div class="vjs-tree-list-holder-inner" :style="{ transform: `translateY(${translateY}px)` }">
            <template v-for="item in visibleData" :key="item.id">
              <TreeNode
                :node="item"
                :collapsed="(!!hiddenPaths[item.path])"
                :showDoubleQuotes="showDoubleQuotes"
                :showLength="showLength"
                :showLine="showLine"
                :showLineNumber="showLineNumber"
                :showIcon="showIcon"
                :collapsedOnClickBrackets="collapsedOnClickBrackets"
                :renderNodeKey="renderNodeKey"
                :renderNodeValue="renderNodeValue"
                @node-click="handleNodeClick"
                @brackets-click="handleBracketsClick"
                @icon-click="handleIconClick"
                :style="{
                  ...((itemHeight && itemHeight != 20) && { lineHeight: `${itemHeight}px` })
                }"
              />
            </template>
          </div>
        </div>
      </div>
    </template>

    <template v-else>
      <template v-for="item in visibleData" :key="item.id">
        <TreeNode
          :node="item"
          :collapsed="(!!hiddenPaths[item.path])"
          :showDoubleQuotes="showDoubleQuotes"
          :showLength="showLength"
          :showLine="showLine"
          :showLineNumber="showLineNumber"
          :showIcon="showIcon"
          :collapsedOnClickBrackets="collapsedOnClickBrackets"
          :renderNodeKey="renderNodeKey"
          :renderNodeValue="renderNodeValue"
          @node-click="handleNodeClick"
          @brackets-click="handleBracketsClick"
          @icon-click="handleIconClick"
          :style="{
            ...((itemHeight && itemHeight != 20) && { lineHeight: `${itemHeight}px` })
          }"
        />
      </template>
    </template>
  
  </div>
</template>

<style scoped lang="scss">
@import './themes.scss';

.vjs-tree {
  font-family: 'Monaco', 'Menlo', 'Consolas', 'Bitstream Vera Sans Mono', monospace;
  font-size: 14px;
  text-align: left;

  &.is-virtual {
    overflow: auto;

    :deep(.vjs-tree-node) {
      white-space: nowrap;
    }
  }

  &.has-line-number {
    padding-left: v-bind(leftPadding);
  }
}
</style>

<script>
import { emitError, jsonFlatten } from './utils';
import TreeNode, { treeNodePropsPass } from './TreeNode.vue';

// https://github.com/leezng/vue-json-pretty
export default {
  name: "Tree",
  components: {
    TreeNode
  },
  props: {
    ...treeNodePropsPass,
    // JSONLike data.
    data: {
      type: Object,
      default: null,
    },
    // Define the depth of the tree, nodes greater than this depth will not be expanded.
    deep: {
      type: Number,
      default: Infinity,
    },
    pathCollapsible: {
      type: Function,
      default: () => false,
    },
    // Data root path.
    rootPath: {
      type: String,
      default: 'root',
    },
    // Whether to use virtual scroll, usually applied to big data.
    virtual: {
      type: Boolean,
      default: false,
    },
    // When using virtual scroll, set the height of tree.
    height: {
      type: Number,
      default: 400,
    },
    // When using virtual scroll, define the height of each row.
    itemHeight: {
      type: Number,
      default: 20,
    },
    style: Object,
  },
  emits: [
    'nodeClick',
    'bracketsClick',
    'iconClick',
  ],
  computed: {
    flatData() {
      let startHiddenItem = null;
      const data = [];
      const length = this.originFlatData.length;
      for (let i = 0; i < length; i++) {
        const cur = this.originFlatData[i];
        const item = {
          ...cur,
          id: i,
        };
        const isHidden = this.hiddenPaths[item.path];
        if (startHiddenItem && startHiddenItem.path === item.path) {
          const isObject = startHiddenItem.type === 'objectStart';
          const mergeItem = {
            ...item,
            ...startHiddenItem,
            showComma: item.showComma,
            content: isObject ? '{...}' : '[...]',
            type: isObject ? 'objectCollapsed' : 'arrayCollapsed',
          };
          startHiddenItem = null;
          data.push(mergeItem);
        } else if (isHidden && !startHiddenItem) {
          startHiddenItem = item;
          continue;
        } else {
          if (startHiddenItem) continue;
          else data.push(item);
        }
      }
      return data;
    },
    hiddenPaths: {
      get() {
        const paths = this.originFlatData.reduce((acc, item) => {
          const depthComparison = item.level >= this.deep;
          const pathComparison = this.pathCollapsible(item);
          if (!!~['objectStart', 'arrayStart'].indexOf(item.type) && (depthComparison || pathComparison)) {
            return {
              ...acc,
              [item.path]: 1,
            };
          }
          return acc;
        });

        return {
          ...this.originHiddenPaths,
          ...paths,
        };
      },
      set(newVal) { 
        this.originHiddenPaths = newVal;
      },
    },
    leftPadding() {
      return `${Number(this.originFlatData.length.toString().length) * 12}px`;
    }
  },
  data() {
    return {
      originFlatData: jsonFlatten(this.data, this.rootPath),
      originHiddenPaths: {},
      translateY: 0,
      visibleData: [],
    };
  },
  mounted() {
    this.$watch(vm => [vm.selectableType, vm.selectOnClickNode, vm.showSelectController], () => {
      const error = this.selectableType && !this.selectOnClickNode && !this.showSelectController;
      const message = error
        ? 'When selectableType is not null, selectOnClickNode and showSelectController cannot be false at the same time, because this will cause the selection to fail.'
        : '';
      if (error) {
        emitError(message);
      }
    });
    this.$watch(vm => [vm.data, vm.flatData], () => {
      this.updateVisibleData();
    });

    if (this.data) {
      this.updateVisibleData();
    }    
  },
  methods: {
    updateVisibleData() {
      const flatDataValue = this.flatData;
      if (this.virtual) {
        const visibleCount = this.height / this.itemHeight;
        const scrollTop = this.$el.scrollTop || 0;
        const scrollCount = Math.floor(scrollTop / this.itemHeight);
        let start =
          scrollCount < 0
            ? 0
            : scrollCount + visibleCount > flatDataValue.length
            ? flatDataValue.length - visibleCount
            : scrollCount;
        if (start < 0) {
          start = 0;
        }
        const end = start + visibleCount;
        this.translateY = start * this.itemHeight;
        this.visibleData = flatDataValue.filter((item, index) => index >= start && index < end);

      } else {
        this.visibleData = flatDataValue;
      }
    },
    updateCollapsedPaths(collapsed, path) {
      if (collapsed) {
        this.hiddenPaths = {
          ...this.hiddenPaths,
          [path]: 1,
        };
      } else {
        const newPaths = { ...this.hiddenPaths };
        delete newPaths[path];
        this.hiddenPaths = newPaths;
      }
    },
    handleTreeScroll() {
      if (!this.virtual) return;
      this.updateVisibleData();
    },
    handleNodeClick(node) {
      this.$emit('nodeClick', node);
    },
    handleBracketsClick(collapsed, path) {
      if (this.collapsedOnClickBrackets) {
        this.updateCollapsedPaths(collapsed, path);
      }
      this.$emit('bracketsClick', collapsed);
    },
    handleIconClick(collapsed, path) {
      this.updateCollapsedPaths(collapsed, path);
      this.$emit('iconClick', collapsed);
    },
  },
};
</script>