<script>
import { defineAsyncComponent, defineComponent, h } from 'vue';
import { hasChildNodes } from './pathUtils';

const TreeLevel = defineAsyncComponent(() => import('./TreeLevel.vue'));

const Arrow = defineComponent({
  name: 'Arrow',
  props: {
    expanded: {
      type: Boolean,
      default: false,
    }
  },
  render() {
    return h('span', {
      class: [
        'arrow',
        {
          'expanded': this.expanded
        }
      ]
    });
  }
});

export default {
  name: 'TreeNode',
  components: {
    TreeLevel,
    Arrow
  },
  props: {
    name: {
      type: String,
      default: '',
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
    options: {
      type: Object,
      default: {}
    },
  },
  inject: [ 'setExpandedPaths', 'isExpanded' ],
  computed: {
    expanded() {
      return this.isExpanded(this.path);
    },
    nodeHasChildNodes() {
      return hasChildNodes(this.data, this.dataIterator);
    },
    shouldShowPlaceholder() {
      return this.depth > 0;
    }
  },
  methods: {
    handleClick(e) {
      if (this.nodeHasChildNodes) {
        this.setExpandedPaths(this.path, this.expanded);
      }
    },
  },
  render() {
    const nodeRenderer = this.$slots.default || ((props) => h('span', null, props.name));

    const rendererParams = {
      name: this.name,
      data: this.data,
      path: this.path,
      depth: this.depth,
      title: this.title,
      expanded: this.expanded,
      ...this.options
    };

    let preFix = '';
    if (this.nodeHasChildNodes) {
      preFix = h(Arrow, { expanded: this.expanded });

    } else if (this.shouldShowPlaceholder) {
      preFix = h('span', { class: 'placeholder' }, ' ');
    }

    return h('li', {
      'aria-expanded': this.expanded,
      role: 'treeitem',
      class: 'tree-node',
      title: this.title
    }, [
      h('div', {
        class: 'preview-container',
        onClick: (e) => this.handleClick(e),
      }, [ preFix, nodeRenderer(rendererParams) ]),
      
      this.nodeHasChildNodes && h(TreeLevel, {
        name: this.name,
        data: this.data,
        dataIterator: this.dataIterator,
        path: this.path,
        depth: this.depth,
        title: this.title,
        expanded: this.expanded,
        role: 'group',
        class: 'child-nodes-container'
      }, { default: nodeRenderer })
    ]);
  },
}
</script>