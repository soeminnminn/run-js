<template>
  <div class="expandable-panel">
    <div :class="{ 'panel-header': true, 'expanded': !collapsed }" @click="handleHeaderClick">
      <span :class="{ 'expand-arrow': true, 'close': collapsed }"></span>
      <div class="panel-title">
        <slot name="header">{{ title }}</slot>
      </div>
    </div>
    <div :class="{ 'panel-body': true, 'panel-body-height': !collapsed }">
      <div class="panel-body-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.expandable-panel {
  .panel-header {
    position: relative;
    width: 100%;
    height: 1.75rem;
    line-height: 1.75rem;
    border-radius: 0.2rem;
    border: v-bind(borderStyle);
    display: flex;
    flex-flow: row;
    align-items: center;
    transition: border-radius .3s ease-in-out;

    .expand-arrow {
      width: 1rem;
      height: 1rem;
      display: inline-block;
      position: relative;
      flex: none;
      margin: 0 0 0 0.5rem;
      cursor: pointer;

      &::before, &::after {
        content: '';
        top: .5rem;
        position: absolute;
        width: .625rem;
        height: .15rem;
        background-color: #efefef;
        display: inline-block;
        transition: all .3s ease;
        border-radius: .3rem;
      }

      &::before {
        left: 0;
        transform: rotate(45deg);
      }

      &::after {
        right: 0;
        transform: rotate(-45deg);
      }

      &.close {
        &::before {
          transform: rotate(-45deg);
        }

        &::after {
          transform: rotate(45deg);
        }
      }
    }

    .panel-title {
      font-weight: bold;
      margin-left: 0.5rem;
    }

    &.expanded {
      border-bottom: 2px solid #4F4F4F!important;
      border-radius: 0.2rem 0.2rem 0 0!important;
    }
  }

  .panel-body {
    width: 100%;
    max-height: 0;
    overflow: hidden;
    border-radius: 0 0 0.2rem 0.2rem;
    transition: all .3s ease-in-out;
    border-left: v-bind(borderStyle);
    border-right: v-bind(borderStyle);

    &-height {
      max-height: v-bind(contentHeight);
      border-bottom: v-bind(borderStyle);
    }

    &-content {
      padding: 1rem;
    }
  }
}
</style>

<script>
export default {
  name: 'Expander',
  props: {
    title: String,
    border: [Boolean, String],
  },
  data () {
    return {
      collapsed: true,
    };
  },
  computed: {
    contentHeight() {
      if (this.$el) {
        const rect = this.$el.getBoundingClientRect();
        return `${rect.height}px`;
      }
      return '1.75rem';
    },
    borderStyle() {
      if (this.border) {
        if (typeof(this.border) == 'string') {
          return this.border;
        }
        return `2px solid #4F4F4F`;
      }
      return '0';
    }
  },
  methods: {
    handleHeaderClick(e) {
      const collapsed = this.collapsed;
      this.collapsed = !collapsed;
    }
  },
}
</script>