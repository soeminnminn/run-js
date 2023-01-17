<template>
  <label class="toggle">
    <input class="toggle-checkbox" type="checkbox" v-model="value" @change="handleChange">
    <div class="toggle-switch"></div>
    <span class="toggle-label">{{ label }}</span>
  </label>
</template>

<style scoped>
.toggle {
  cursor: pointer;
  display: inline-block;
}

.toggle-switch {
  display: inline-block;
  background: #ccc;
  border-radius: 16px;
  width: 2rem;
  height: 1.15rem;
  position: relative;
  vertical-align: middle;
  transition: background 0.25s;
}
.toggle-switch:before, .toggle-switch:after {
  content: "";
}
.toggle-switch:before {
  display: block;
  background: linear-gradient(to bottom, #fff 0%, #eee 100%);
  border-radius: 50%;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.25);
  width: 0.85rem;
  height: 0.85rem;
  position: absolute;
  top: 0.15rem;
  left: 0.17rem;
  transition: left 0.25s;
}
.toggle:hover .toggle-switch:before {
  background: linear-gradient(to bottom, #fff 0%, #fff 100%);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.5);
}
.toggle-checkbox:checked + .toggle-switch {
  background: #56c080;
}
.toggle-checkbox:checked + .toggle-switch:before {
  left: 1rem;
}

.toggle-checkbox {
  position: absolute;
  visibility: hidden;
}

.toggle-label {
  margin-left: 5px;
  position: relative;
  top: 2px;
}
</style>

<script>

export default {
  name: 'ToggleSwitch',
  props: {
    label: {
      type: String,
      default: ''
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
  emits: [ 'change', 'update:modelValue' ],
  methods: {
    handleChange(e) {
      this.$emit('change', e);
    }
  }
}
</script>