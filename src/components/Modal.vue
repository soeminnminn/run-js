<template>
  <Teleport to="body">
    <div class="modal-mask" v-if="visible" @click="onWrapClick">
      <div class="modal-wrapper">
        <div ref="modalContainer" class="modal-container" :style="containerStyle">
          <div class="modal-header" v-if="!headerHide">
            <slot name="header" />
          </div>  

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
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  margin: 0px auto;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: Helvetica, Arial, sans-serif;
  max-width: 80% !important;
}

.modal-header {
  padding: 0.75rem 1rem 0.25rem 1rem;
  border-bottom: 1px solid #e8eaec;
}

.modal-header :deep(h3) {
  margin-top: 0;
  font-size: 1.25rem;
  font-weight: 500;
}

.modal-body {
  max-height: calc(100vh - 20em);
  padding: 0.5rem 0.8rem;
  overflow: auto;
}

.modal-footer {
  display: flex;
  justify-content: end;
  padding: 0.5rem 1rem;
  border-top: 1px solid #e8eaec;
}

.modal-footer > :deep(button) {
  flex: none;
  margin-left: 0.5rem;
}
</style>

<script lang="js">
export default {
  name: 'Modal',
  props: {
    modelValue: {
      type: Boolean,
      default: false
    },
    closable: {
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