<template>
  <textarea
    :placeholder="placeholder"
    class="cmd-textarea"
    :style="{
      'min-height': `1.25rem`
    }"
    :value="modelValue"
    :maxlength="maxLength"
    @input="onChangeInput"
    @keydown.esc="escapeTextarea"
    @keydown.enter.exact.prevent=""
    @keydown.up="updateUpOrDown($event, -1)"
    @keydown.down="updateUpOrDown($event, 1)" />
</template>

<style scoped lang="scss">
.cmd-textarea {
  max-height: 18.75rem;
	overflow-y: auto;
	height: 1.25rem;
	width: 100%;
	line-height: 1.25rem;
	outline: 0;
	resize: none;
	padding: 0;
	box-sizing: content-box;
  background: none;
	border: none;
  color: inherit;

	&::placeholder {
		color: #9ca6af;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
}
</style>

<script>
function removeFromTo(array, from, to) {
  array.splice(from, !to || 1 + to - from + (!(to < 0 ^ from >= 0) && (to < 0 || -1) * array.length));
  return array.length;
}

class CommandStore {
  constructor(limit = 0) {
    this._list = [];
    this._index = -1;
    this._limit = limit;
  }

  setLimit(value) {
    this._limit = value;
  }

  push(value) {
    if (!value || value == '') return this;

    const idx = this._list.findIndex(x => x == value);
    if (idx > -1) {
      this._list.splice(idx, 1);
    }

    this._list.push(value);

    // if limit is set, remove items from the start
    if (this._limit && this._list.length > this._limit) {
      removeFromTo(this._list, 0, -(this._limit + 1));
    }

    // set the current index to the end
    this._index = this._list.length - 1;
    return this;
  }

  previous() {
    const current = this._list[this._index];
    this._index = Math.max(this._index - 1, -1);
    return current;
  }

  next() {
    const current = this._list[this._index];
    this._index = Math.min(this._index + 1, this._list.length);
    return current;
  }

  clear() {
    this._list = [];
    this._index = -1;
  }

  hasPrevious() {
    return this._index > -1;
  }

  hasNext() {
    return this._index < this._list.length;
  }
}

export default {
  name: 'CommandInput',
  props: {
    placeholder: {
      type: String,
      default: 'command input'
    },
    modelValue: {
      default: null
    },
    storeLimit: {
      type: Number,
      default: 20
    },
    maxLength: {
      type: Number,
      default: 200
    }
  },
  emits: [
    'update:modelValue',
    'submit',
    'cancel'
  ],
  data() {
    return {
      commandStore: new CommandStore(this.storeLimit)
    };
  },
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value) {
        this.$emit('update:modelValue', value);
      }
    },
  },
  mounted() {
    let isComposed = true;
    this.$el.addEventListener('keyup', e => {
      if (e.key === 'Enter' && !e.shiftKey && isComposed) {
        this.sendMessage(e);
      }
			isComposed = !e.isComposing;
    });
  },
  methods: {
    onChangeInput(e) {
      if (this.$el.value || this.$el.value === '') {
				this.value = this.$el.value;
			}
      this.resizeTextarea();
    },
    sendMessage(e) {
      if (this.modelValue) {
        this.commandStore.push(this.modelValue);
      }      
      this.$emit('submit', e);
    },
    escapeTextarea(e) {
      this.$emit('cancel', e);
    },
    updateUpOrDown(e, delta) {
      if (delta < 0 && this.commandStore.hasPrevious()) {
        this.value = this.commandStore.previous();

      } else if(delta > 0 && this.commandStore.hasNext()) {
        this.value = this.commandStore.next();
      }
    },
    resizeTextarea() {
			if (!this.$el) return;
			const padding = window
				.getComputedStyle(this.$el, null)
				.getPropertyValue('padding-top')
				.replace('px', '');
      this.$el.style.height = 0;
			this.$el.style.height = `${this.$el.scrollHeight - padding * 2}px`;
		},
    focus() {
      const element = this.$el;
      if (element) {
        element.focus();

        if (!element.selectionStart) {
          element.setSelectionRange(element.value.length, element.value.length);
        }
      }      
    },
  }
}
</script>