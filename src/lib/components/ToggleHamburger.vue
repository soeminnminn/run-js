<template>
  <label class="hamburger" @click="handleClick">
    <input v-if="toggle" type="checkbox" v-model="value" @change="handleChange"/>
    <div class="hamburger-lines">
      <span></span>
      <span></span>
      <span></span>
    </div>
  </label>
</template>

<style scoped>
.hamburger {
  display: block;
  position: relative;
  width: 1.875rem;
  height: 1.875rem;
  cursor: pointer;
  border-radius: 0.25rem;
}

.hamburger:hover {
  background: #424649;
}

.hamburger input[type="checkbox"] {
  display: block;
  opacity: 0;
  user-select: none;
}

.hamburger .hamburger-lines {
  display: block;
  height: 1.125rem;
  width: 1.375rem;
  position: absolute;
  top: 0.375rem;
  left: 0.275rem;
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.hamburger .hamburger-lines span {
  display: block;
  height: 0.2rem;
  width: 100%;
  border-radius: 0.1rem;
  background: #eaeaea;
  transition: transform 0.2s ease-in-out;
}

.hamburger .hamburger-lines span:nth-child(1) {
  transform-origin: 0% 0%;
  transition: transform 0.4s ease-in-out;
}

.hamburger .hamburger-lines span:nth-child(3) {
  transform-origin: 0% 100%;
  transition: transform 0.4s ease-in-out;
}

.hamburger input[type="checkbox"]:checked ~ .hamburger-lines span:nth-child(1) {
  transform: translateX(0.275rem) rotate(45deg);
}

.hamburger input[type="checkbox"]:checked ~ .hamburger-lines span:nth-child(2) {
  transform: scaleY(0);
}

.hamburger input[type="checkbox"]:checked ~ .hamburger-lines span:nth-child(3) {
  transform: translateX(0.275rem) rotate(-45deg);
}
</style>

<script>

export default {
  name: 'ToggleHamburger',
  props: {
    toggle: {
      type: Boolean,
      default: true
    },
    modelValue: {
      type: Boolean,
      default: false
    },
  },
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    }
  },
  emits: [ 'click', 'change', 'update:modelValue' ],
  methods: {
    handleClick(e) {
      this.$emit('click', e);
    },
    handleChange(e) {
      this.$emit('change', e);
    },
  }
}
</script>