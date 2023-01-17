<script>
import { defineAsyncComponent, h } from 'vue';

const TreeNode = defineAsyncComponent(() => import('./TreeNode.vue'));

export default {
  name: 'TreeLevel',
  components: {
    TreeNode
  },
  props: {
    name: {
      type: String,
      required: false,
    },
    data: {
      default: undefined
    },
    dataIterator: {
      type: Function,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    depth: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      default: ''
    },
    expanded: {
      type: Boolean,
      default: false,
    },
    options: {
      type: Object,
      default: {}
    },
  },
  render() {
    const nodeRenderer = this.$slots.default || (() => '');
    let children = [];

    if (this.expanded) {
      const dataIterator = this.dataIterator;

      children = [...dataIterator(this.data)].map(({ name, data, ...extraProps }) => {
        return h(TreeNode, {
          name,
          data,
          dataIterator: this.dataIterator,
          path: `${this.path}.${name}`,
          depth: this.depth + 1,
          title: this.title,
          options: {
            ...this.options,
            ...extraProps
          },
        }, {
          default: nodeRenderer
        });
      });
    }

    return h('ol', null, children);
  },
}
</script>