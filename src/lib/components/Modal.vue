<template>
  <Teleport to="body">
    <div :class="{'modal-mask': true, 'dark': colorScheme == 'dark'}" v-if="visible" @click="onWrapClick">
      <div :class="{ 'modal-wrapper': true, 'modal-scrollable': scrollable }">
        <div ref="modalContainer" class="modal-container" :style="containerStyle">
          <div class="modal-header" v-if="!headerHide">
            <slot name="header" />
          </div>  
          <button type="button" v-if="showClose" class="modal-close" @click="close">&times;</button>

          <div class="modal-body">
            <slot />
          </div>

          <div class="modal-footer" v-if="!footerHide">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-mask {
  display: flex;
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s ease;
  align-items: center;
  justify-content: center;
}

.modal-container {
  display: inline-flex;
  flex-flow: column;
  position: relative;
  margin: auto 0;
  background-color: #fff;
  border-radius: 0.25rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: Helvetica, Arial, sans-serif;
  max-height: 94vh;
}

.modal-header {
  position: relative;
  display: inline-flex;
  flex-flow: row;
  width: 100%;
  align-items: center;
  padding: 0.25rem 1rem;
  border-bottom: 1px solid #e0e0e0;
  min-height: 2.415rem;
}

.modal-header :deep(h3) {
  margin-top: 0;
  font-size: 1.25rem;
  font-weight: 500;
}

.modal-close {
  padding: 0 0.25rem;
  border-radius: 0.25rem;
  color: transparent!important;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23999'%3e%3cpath d='M.293.293a1 1 0 0 1 1.414 0L8 6.586 14.293.293a1 1 0 1 1 1.414 1.414L9.414 8l6.293 6.293a1 1 0 0 1-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 8 .293 1.707a1 1 0 0 1 0-1.414z'/%3e%3c/svg%3e");
  background-color: transparent;
  background-position: center;
  background-repeat: no-repeat;
  background-size: 0.625rem;
  border: none;
  width: 2rem;
  height: 2rem;
  position: absolute;
  right: 0.215rem;
  top: 0.1rem;
}
.modal-close:hover {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23eee'%3e%3cpath d='M.293.293a1 1 0 0 1 1.414 0L8 6.586 14.293.293a1 1 0 1 1 1.414 1.414L9.414 8l6.293 6.293a1 1 0 0 1-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 8 .293 1.707a1 1 0 0 1 0-1.414z'/%3e%3c/svg%3e");
  background-color: rgb(232, 17, 35);
}

.modal-body {
  position: relative;
  padding: 0.5rem 0.8rem;
  overflow-x: hidden;
  overflow-y: auto;
}

.modal-footer {
  position: relative;
  display: flex;
  justify-content: end;
  padding: 0.5rem 1rem;
  border-top: 1px solid #e8eaec;
}

.modal-footer > :deep(button) {
  flex: none;
  margin-left: 0.5rem;
}

.modal-scrollable {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  padding: 1rem 0;
  overflow-y: auto;
}

.modal-scrollable .modal-container {
  flex: none;
  max-height: max-content;
}

.modal-scrollable .modal-body {
  overflow: visible !important;
}

.dark .modal-mask {
  background-color: rgba(255, 255, 255, 0.2);
}

.dark .modal-container {
  background-color: #1a1a1a;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.66);
}

.dark .modal-header {
  border-bottom: 1px solid #404040;
}

.dark .modal-footer {
  border-top: 1px solid #404040;
}
</style>

<script>
// https://codepen.io/immarina/pen/oNxXWKa

export default {
  name: 'Modal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    colorScheme: {
      type: String,
      default: 'light'
    },
    scrollable: {
      type: Boolean,
      default: false
    },
    closable: {
      type: Boolean,
      default: true
    },
    showClose: {
      type: Boolean,
      default: true
    },
    headerHide: {
      type: Boolean,
      default: false
    },
    footerHide: {
      type: Boolean,
      default: false
    },
    width: {
      default: '60em'
    }
  },
  emits: [
    'update:modelValue',
    'close'
  ],
  data () {
    return {
      visible: this.modelValue,
      containerStyle: {
        'width': this.width
      },
    }
  },
  watch: {
    modelValue(val) {
      this.visible = val;
      if (val) {
        this.$nextTick(this.bindModalClose);
      }
    },
  },
  mounted () {
    // ESC close
    document.addEventListener('keydown.modal', this.escClose);
  },
  beforeUnmount () {
    document.removeEventListener('keydown.modal', this.escClose);
  },
  methods: {
    bindModalClose() {
      if (this.$refs.modalContainer) {
        const closeEls = this.$refs.modalContainer.querySelectorAll('[modal-close]');
        if (closeEls && closeEls.length) {
          const closeFn = this.close.bind(this);
          closeEls.forEach(el => {
            el.addEventListener('click', closeFn);
          });
        }
      }
    },
    onWrapClick($event) {
      if (this.$refs.modalContainer) {
        if (this.$refs.modalContainer.contains($event.target)) return;
        
        if (this.closable) {
          this.close();
        }  
      }
    },
    close() {
      this.visible = false;
      this.$emit('update:modelValue', false);
      this.$emit('close');
    },
    escClose(e) {
      if (this.closable && this.visible && e.keyCode === 27) {
        this.close();
      }
    },
  },
}
</script>