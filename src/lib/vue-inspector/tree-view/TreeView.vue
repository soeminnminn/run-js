<script>
import { h } from 'vue';

import { DEFAULT_ROOT_PATH, getExpandedPaths } from './pathUtils.js';

import TreeNode from './TreeNode.vue';

const defaultNodeRenderer = ({ name, data }) => {
  return h('span', null, [
    h('span', null, name),
    h('span', null, ': '),
    h('span', null, `${String(data)}`)
  ]);
};

export default {
  name: 'TreeView',
  components: {
    TreeNode
  },
  props: {
    name: {
      type: String,
      default: undefined
    },
    data: {
      default: undefined
    },
    dataIterator: {
      type: Function,
      required: true
    },
    expandPaths: {
      default: []
    },
    expandLevel: {
      type: Number,
      default: 0
    },
    options: {
      type: Object,
      default: {}
    },
  },
  data() {
    return {
      internalExpandPaths: {},
    };
  },
  provide() {
    return {
      setExpandedPaths: (path, expanded) => {
        const prevExpandedPaths = {
          ...this.internalExpandPaths,
          [path]: !expanded
        };

        this.internalExpandPaths = getExpandedPaths(this.data, this.dataIterator, this.expandPaths, this.expandLevel, prevExpandedPaths);
      },
      isExpanded: (path) => !!this.internalExpandPaths[path],
    };
  },
  render() {
    const nodeRenderer = this.$slots.default || defaultNodeRenderer;

    return h('ol', { role: 'tree', class: 'tree-view-outline' }, 
      h(TreeNode, {
        name: this.name,
        data: this.data,
        dataIterator: this.dataIterator,
        path: DEFAULT_ROOT_PATH,
        depth: 0,
        options: this.options,
      }, {
        default: nodeRenderer
      })
    );
  },
}
</script>