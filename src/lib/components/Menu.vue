<style>
:root {
  --color-bg-primary: #d0d6df;
  --color-bg-primary-offset: rgba(100, 100, 100, 0.3);
  --color-bg-secondary: #fff;
  --color-text-primary: #3a3c42;
  --color-text-primary-offset: #898c94;
  --menu-border-radius: 0.25rem;
}

.menu-bar {
  display: inline-flex;
  flex-flow: row;
  position: relative;
}
.menu-button {
  position: relative;
  display: inline-block;
  min-width: 1rem;
  flex: none;
  cursor: pointer;
  user-select: none;
  border-radius: var(--menu-border-radius);
}
.menu-button:hover {
  background-color: var(--color-bg-primary-offset);
}
.menu-bar .menu-button {
  padding: 0 1rem;
}
.menu-dropdown,
.menu-bar .menu {
  position: absolute;
  top: 100%;
  margin-top: 0.25rem;
  left: 0;
  z-index: 1000;
  float: left;
  min-width: 3rem;
  display: none;
  flex-flow: column;
  background-color: var(--color-bg-secondary);
  color: var(--color-text-primary);
  border-radius: var(--menu-border-radius);
  box-shadow: 0 10px 20px rgba(#404040, 0.15);
  padding: .25rem 0;
}
.menu-dropdown.show, .menu-bar .menu.show {
  display: flex;
}
.menu-bar .menu {
  margin-top: 0;
  border-radius: 0 var(--menu-border-radius) var(--menu-border-radius) var(--menu-border-radius);
}
.menu-bar .menu-button.show {
  background-color: var(--color-bg-secondary);
  border-radius: var(--menu-border-radius) var(--menu-border-radius) 0 0;
  color: var(--color-text-primary);
}

.menu-arrow {
  margin-top: 0.725rem;
}

.menu-arrow:before {
  content: '';
  width: .75em;
  height: .75em;
  background-color: var(--color-bg-secondary);
  position: absolute;
  top: -.375em;
  left: calc(56px / 2 - 1rem);
  transform: rotate(45deg);
}

.menu-dropdown.menu-right {
  right: 0;
  left: auto;
}

.menu .menu-group {
  margin: 0;
  display: block;
  width: 100%;
  padding: 0.25rem;
  list-style: none;
  position: relative;
}
.menu .menu-group + .menu-group::before {
  content: '';
  display: block;
  height: 1px;
  width: 90%;
  margin-left: 5%;
  margin-bottom: 0.375rem;
  border-top: 1px solid #ddd;
}
.menu .menu-sub-group {
  display: none;
  position: relative;
  padding: 0.5rem 0.25rem;
  background-color: var(--color-bg-secondary);
  border-radius: var(--menu-border-radius);
  box-shadow: 0 10px 20px rgba(#404040, 0.15);
  position: absolute;
  left: 103%;
  z-index: 100;
  top: 0;
  flex-direction: column;
  list-style: none;
}
.menu .menu-sub-group:hover {
  display: flex;
}

.menu .menu-item {
  font: inherit;
  border: 0;
  padding: 0.25rem 0.5rem;
  padding-right: 1.25rem;
  width: 100%;
  min-width: 10rem;
  border-radius: var(--menu-border-radius);
  text-align: left;
  font-size: 90%;
  display: flex;
  flex-flow: row nowrap;
  justify-content: left;
  align-content: center;
  gap: 4px;
  position: relative;
  cursor: pointer;
}
.menu .menu-item:hover {
  background-color: var(--color-bg-primary-offset);
}
.menu .menu-item > * {
  flex: auto;
}
.menu .menu-item i:first-child,
.menu .menu-item svg:first-child {
  flex: none;
  min-width: 1.5rem;
}
.menu .menu-item .icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.25rem;
  flex: none;
}
.menu .menu-item .shortcuts {
  color: var(--color-text-primary-offset);
  font-size: 85%;
  font-weight: 600;
  flex: none;
  min-width: 2.5rem;
  text-align: right;
  margin-left: auto;
}
.menu .menu-item:hover > .menu-sub-group {
  display: flex;
}
.menu .menu-item[checked], .menu .menu-item.checkable, .menu .menu-item.no-icon {
  padding-left: 2.25rem;
}
.menu .menu-item[checked]::before {
  content: '';
  display: inline-block;
  position: absolute;
  left: 1rem;
  margin-top: 0.215rem;
  transform: rotate(45deg);
  height: 0.8em;
  width: 0.43em;
  border-bottom: 0.15em solid;
  border-right: 0.15em solid;
}
.menu .menu-item[disabled] {
  color: var(--color-text-primary-offset);
  cursor: not-allowed;
}
.menu .menu-item[disabled]:hover > .menu-sub-group {
  display: none!important;
}
.menu .menu-item.has-submenu::after {
  content: '';
  border: solid var(--color-text-primary-offset);
  border-width: 0 2px 2px 0;
  display: block;
  position: absolute;
  right: 0.5rem;
  margin-top: 0.5rem;
  padding: 3px;
  transform: rotate(-45deg);
  -webkit-transform: rotate(-45deg);
  pointer-events: none;
}
.menu .menu-sub-group .menu-item {
  font-size: 100%;  
}
</style>

<script>
import { defineComponent, h } from 'vue';

export const MenuItem = defineComponent({
  name: 'MenuItem',
  props: {
    shortcuts: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    checkable: {
      type: Boolean,
      default: false
    },
    checked: {
      type: Boolean,
      default: false
    },
    noIcon: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      hasSubmenu: false,
    };
  },
  emits: [ 'click' ],
  inject: [ 'onItemClick' ],
  mounted() {
    this.hasSubmenu = !!(this.$el.querySelector('.menu-sub-group'));
  },
  render() {
    const children = [];
    children.push(this.$slots.default({}));
    if (this.shortcuts) {
      children.push(h('span', { class: 'shortcuts' }, this.shortcuts));
    }
    const attrs = {};
    if (this.disabled) {
      attrs['disabled'] = true;
    }
    if (this.checked && !this.hasSubmenu) {
      attrs['checked'] = true;
    }

    return h('li', { 
      class: [
        'menu-item',
        {
          'has-submenu': this.hasSubmenu,
          'checkable': this.checkable,
          'no-icon': this.noIcon
        }        
      ], 
      ...attrs,
      onClick: (e) => this.handleClick(e) 
    }, children);
  },
  methods: {
    handleClick(e) {
      if (this.hasSubmenu || this.disabled) return;

      if (typeof(this.onItemClick) == 'function') {
        this.onItemClick(this);
      }
      this.$emit('click', e);
    }
  },
});

export const MenuGroup = defineComponent({
  name: 'MenuGroup',
  render() {
    return h('ul', { class: 'menu-group' }, this.$slots.default({}));
  },
});

export const SubMenuGroup = defineComponent({
  name: 'SubMenuGroup',
  render() {
    return h('ul', { class: 'menu-sub-group' }, this.$slots.default({}));
  },
});

export const Menu = defineComponent({
  name: 'Menu',
  props: {
    header: {
      type: String,
      default: '',
    },
  },
  render() {
    return h('div', { 
      class: 'menu', 
      'data-header': this.header 
    }, this.$slots.default({}));
  }
});

export const MenuDropdown = defineComponent({
  name: 'MenuDropdown',
  props: {
    show: Boolean,
    modelValue: Boolean,
    right: Boolean,
    closeOnClickOutside: {
      type: Boolean,
      default: true
    },
    showArrow: {
      type: Boolean,
      default: true
    },
  },
  emits: [
    'update:modelValue',
    'click',
    'itemClick'
  ],
  data() {
    return {
      showPanel: false,
      top: false,
    }
  },
  provide() {
    return {
      onItemClick: (e) => {
        this.$emit('itemClick', e);
        this.closeMenu();
      },
    };
  },
  created() {
    this.$watch(vm => [vm.show, vm.modelValue], this.watchValue);
  },
  mounted() {
    document.addEventListener('pointerdown', this.handleGlobalDown);
  },
  beforeUnmount() {
    document.removeEventListener('pointerdown', this.handleGlobalDown);
  },
  methods: {
    watchValue(v) {
      if (v) {
        this.top = false;
        this.$nextTick(() => {
          const rect = this.$refs.dropdown.getBoundingClientRect();
          const window_height = (window.innerHeight || document.documentElement.clientHeight);
          this.top = (rect.bottom > window_height) && (rect.top >= rect.height);
        });
      }
    },
    closeMenu() {
      if (this.show) return;
      if (this.showPanel && this.closeOnClickOutside) {
        this.showPanel = false;
        this.$emit('update:modelValue', false);
      }
    },
    toggleMenu() {
      if (this.show) return;
      this.showPanel = !this.showPanel;
      this.$emit('update:modelValue', !this.show);
    },
    handleGlobalDown(e) {
      if (!this.$el.contains(e.target)) {
        if (this.show) return;

        if (this.showPanel && this.closeOnClickOutside) {
          this.showPanel = false;
          this.$emit('update:modelValue', false);
        }
      }
    },
    handleDown(e) {
      this.toggleMenu();
    },
  },
  render() {
    return h('div', { 
      class: 'menu-button',
      onPointerdown: (e) => this.handleDown(e),
    }, [
      this.$slots.default(),
      h('div', {
        ref: 'dropdown',
        class: [
          'menu-dropdown',
          'menu',
          {
            'menu-right': this.right,
            'menu-arrow': this.showArrow,
            'show': this.show || (!this.show && this.showPanel),
          }
        ]
      }, this.$slots.menu({}))
    ]);
  }
});

export default {
  name: 'MenuBar',
  data() {
    return {
      showMenu: false,
      currentShow: null,
      headers: [],
    };
  },
  emits: [ 'itemClick' ],
  provide() {
    return {
      onItemClick: (e) => {
        this.$emit('itemClick', e);
        this.hideAllMenu();
        this.currentShow = null;
        this.showMenu = false;
      },
    };
  },
  mounted() {
    const menus = this.$el.querySelectorAll('.menu');
    if(menus.length) {
      this.headers = [];
      for (const i in menus) {
        if (menus[i].parentElement) {
          this.headers.push(menus[i].dataset['header']);
        }
      }
    }
    document.addEventListener('pointerdown', this.handleGlobalDown);
  },
  beforeUnmount() {
    document.removeEventListener('pointerdown', this.handleGlobalDown);
  },
  methods: {
    hideAllMenu() {
      const buttons = this.$el.querySelectorAll('.menu-button');
      for (const i in buttons) {
        if (buttons[i].classList) {
          buttons[i].classList.remove('show');
        }
      }

      const menus = this.$el.querySelectorAll('.menu');
      for (const i in menus) {
        if (menus[i].classList) {
          menus[i].classList.remove('show');
        }
      }
    },
    handleGlobalDown(e) {
      if (!this.$el.contains(e.target)) {
        this.hideAllMenu();
        this.currentShow = null;
        this.showMenu = false;
      }
    },
    handleHeaderDown(e, header) {
      if (this.currentShow == header) {
        this.hideAllMenu();
        this.currentShow = null;
        this.showMenu = false;

      } else {
        this.showMenu = true;
        this.currentShow = header;

        this.hideAllMenu();
        e.target.classList.add('show');
        const btnRect = e.target.getBoundingClientRect();
        const elRect = this.$el.getBoundingClientRect();

        const menu = this.$el.querySelector(`[data-header="${header}"]`);
        if(menu && menu.classList) {
          menu.classList.add('show');
          menu.setAttribute('style', `left: ${btnRect.x - elRect.x}px`);
        }
      }
    },
    handleHeaderHover(e, header) {
      if (this.showMenu) {
        this.currentShow = header;
        this.hideAllMenu();
        e.target.classList.add('show');

        const btnRect = e.target.getBoundingClientRect();
        const elRect = this.$el.getBoundingClientRect();

        const menu = this.$el.querySelector(`[data-header="${header}"]`);
        if(menu && menu.classList) {
          menu.classList.add('show');
          menu.setAttribute('style', `left: ${btnRect.x - elRect.x}px`);
        }
      }
    },
  },
  render() {
    const children = [];
    if (this.headers.length) {
      for(const i in this.headers) {
        const header = this.headers[i];
        children.push(h('div', { 
          class: 'menu-button',
          onPointerdown: (e) => this.handleHeaderDown(e, header),
          onPointermove: (e) => this.handleHeaderHover(e, header),
        }, header));
      }
    }
    children.push(this.$slots.default({}));
    return h('div', { class: 'menu-bar' }, children);
  }
};
</script>