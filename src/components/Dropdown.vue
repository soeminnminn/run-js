<template>
  <div
    class="dropdown"
    :class="{ dropup: top }"
    @click="toggle" >
    <slot />
    <transition :name="transition">
      <div
        v-show="show || (!show && showPanel)"
        class="dropdown-menu show"
        :class="{ 'dropdown-menu-right': right }"
        :style="styles"
        @click.stop
        ref="dropdown" >
          <slot name="dropdown" />
      </div>
    </transition>
  </div>
</template>

<style scoped>
.dropdown {
  position: relative;
  min-width: 1rem;
}
.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  display: none;
  float: left;
  min-width: 3rem;
  padding: 0;
  margin: 0.125rem 0 0;
  font-size: 1rem;
  color: #212529;
  text-align: left;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0,0,0,.15);
  border-radius: 0.25rem; 
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;
}

.dropdown-menu.dropdown-menu-right {
  right: 0;
  left: auto;
}

.dropdown-menu.show {
  display: block;
}

/*translate fade (top to down)*/
.dropdown-enter-active, .dropdown-leave-active {
  transition: all 250ms;
  transition-timing-function: cubic-bezier(.53,2,.36,.85);
}
.dropdown-enter, .dropdown-leave-active {
  opacity: 0;
}
.dropdown-enter, .dropdown-leave-to {
  position: absolute;
}

.dropdown-enter {
  transform: translateY(-10px);
}
.dropdown-leave-active {
  transform: translateY(10px);
}
</style>

<script>
export default {
  name: 'Dropdown',
  props: {
    show: Boolean,
    modelValue: Boolean,
    right: Boolean,
    styles: {
      type: Object,
      default () {
        return {}
      }
    },
    transition: {
      type: String,
      default: 'dropdown',
    },
    closeOnClickOutside: {
      type: Boolean,
      default: true
    }
  },
  emits: [
    'update:modelValue',
    'click'
  ],
  data () {
    return {
      showPanel: false,
      top: false,
    }
  },
  created() {
    this.$watch(vm => [vm.show, vm.modelValue], this.watchValue);
  },
  mounted() {
    document.addEventListener('mousedown', this.closeMenu);
    document.addEventListener('pointerdown', this.closeMenu);
  },
  beforeUnmount() {
    document.removeEventListener('mousedown', this.closeMenu);
    document.removeEventListener('pointerdown', this.closeMenu);
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
    closeMenu($event) {
      if (this.show || !this.showPanel) return;
      if (!$event || ($event && !this.$el.contains($event.target) && this.closeOnClickOutside)) {
        this.showPanel = false;
        this.$emit('update:modelValue', false);
      }
    },
    close() {
      if (this.show) return;
      this.showPanel = false;
      this.$emit('update:modelValue', false);
    },
    toggle() {
      if (this.show) return;
      this.showPanel = !this.showPanel;
      this.$emit('update:modelValue', this.showPanel);
    },
  },
}
</script>