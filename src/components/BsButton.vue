<template>
  <component :is="tagName" :class="{
    'btn': true,
    [variantClass]: true,
    'btn-sm': small,
    'active': active
  }" v-bind="attrs" @click="handleClick" >
    <span v-if="loading" :class="{
      'spinner-border': spinnerStyle == 'border',
      'spinner-grow': spinnerStyle == 'grow',
      'spinner-border-sm': spinnerStyle == 'border' && small,
      'spinner-grow-sm': spinnerStyle == 'grow' && small,
    }" role="status" aria-hidden="true" />
    <slot></slot>
  </component>
</template>

<style>
.btn {
  --bs-btn-padding-x: 0.75rem;
  --bs-btn-padding-y: 0.375rem;
  --bs-btn-font-family: ;
  --bs-btn-font-size: 1rem;
  --bs-btn-font-weight: 400;
  --bs-btn-line-height: 1.5;
  --bs-btn-color: #212529;
  --bs-btn-bg: transparent;
  --bs-btn-border-width: 1px;
  --bs-btn-border-color: transparent;
  --bs-btn-border-radius: 0.375rem;
  --bs-btn-hover-border-color: transparent;
  --bs-btn-box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.15),0 1px 1px rgba(0, 0, 0, 0.075);
  --bs-btn-disabled-opacity: 0.65;
  --bs-btn-focus-box-shadow: 0 0 0 0.25rem rgba(var(--bs-btn-focus-shadow-rgb), .5);
}

.btn-primary {
  --bs-btn-color: #fff;
  --bs-btn-bg: #0d6efd;
  --bs-btn-border-color: #0d6efd;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #0b5ed7;
  --bs-btn-hover-border-color: #0a58ca;
  --bs-btn-focus-shadow-rgb: 49,132,253;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #0a58ca;
  --bs-btn-active-border-color: #0a53be;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #fff;
  --bs-btn-disabled-bg: #0d6efd;
  --bs-btn-disabled-border-color: #0d6efd;
}

.btn-secondary {
  --bs-btn-color: #fff;
  --bs-btn-bg: #6c757d;
  --bs-btn-border-color: #6c757d;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #5c636a;
  --bs-btn-hover-border-color: #565e64;
  --bs-btn-focus-shadow-rgb: 130,138,145;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #565e64;
  --bs-btn-active-border-color: #51585e;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #fff;
  --bs-btn-disabled-bg: #6c757d;
  --bs-btn-disabled-border-color: #6c757d;
}

.btn-success {
  --bs-btn-color: #fff;
  --bs-btn-bg: #198754;
  --bs-btn-border-color: #198754;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #157347;
  --bs-btn-hover-border-color: #146c43;
  --bs-btn-focus-shadow-rgb: 60,153,110;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #146c43;
  --bs-btn-active-border-color: #13653f;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #fff;
  --bs-btn-disabled-bg: #198754;
  --bs-btn-disabled-border-color: #198754;
}

.btn-danger {
  --bs-btn-color: #fff;
  --bs-btn-bg: #dc3545;
  --bs-btn-border-color: #dc3545;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #bb2d3b;
  --bs-btn-hover-border-color: #b02a37;
  --bs-btn-focus-shadow-rgb: 225,83,97;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #b02a37;
  --bs-btn-active-border-color: #a52834;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #fff;
  --bs-btn-disabled-bg: #dc3545;
  --bs-btn-disabled-border-color: #dc3545;
}

.btn-warning {
  --bs-btn-color: #000;
  --bs-btn-bg: #ffc107;
  --bs-btn-border-color: #ffc107;
  --bs-btn-hover-color: #000;
  --bs-btn-hover-bg: #ffca2c;
  --bs-btn-hover-border-color: #ffc720;
  --bs-btn-focus-shadow-rgb: 217,164,6;
  --bs-btn-active-color: #000;
  --bs-btn-active-bg: #ffcd39;
  --bs-btn-active-border-color: #ffc720;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #000;
  --bs-btn-disabled-bg: #ffc107;
  --bs-btn-disabled-border-color: #ffc107;
}

.btn-info {
  --bs-btn-color: #000;
  --bs-btn-bg: #0dcaf0;
  --bs-btn-border-color: #0dcaf0;
  --bs-btn-hover-color: #000;
  --bs-btn-hover-bg: #31d2f2;
  --bs-btn-hover-border-color: #25cff2;
  --bs-btn-focus-shadow-rgb: 11,172,204;
  --bs-btn-active-color: #000;
  --bs-btn-active-bg: #3dd5f3;
  --bs-btn-active-border-color: #25cff2;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #000;
  --bs-btn-disabled-bg: #0dcaf0;
  --bs-btn-disabled-border-color: #0dcaf0;
}

.btn-light {
  --bs-btn-color: #000;
  --bs-btn-bg: #f8f9fa;
  --bs-btn-border-color: #f8f9fa;
  --bs-btn-hover-color: #000;
  --bs-btn-hover-bg: #d3d4d5;
  --bs-btn-hover-border-color: #c6c7c8;
  --bs-btn-focus-shadow-rgb: 211,212,213;
  --bs-btn-active-color: #000;
  --bs-btn-active-bg: #c6c7c8;
  --bs-btn-active-border-color: #babbbc;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #000;
  --bs-btn-disabled-bg: #f8f9fa;
  --bs-btn-disabled-border-color: #f8f9fa;
}

.btn-dark {
  --bs-btn-color: #fff;
  --bs-btn-bg: #212529;
  --bs-btn-border-color: #212529;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #424649;
  --bs-btn-hover-border-color: #373b3e;
  --bs-btn-focus-shadow-rgb: 66,70,73;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #4d5154;
  --bs-btn-active-border-color: #373b3e;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #fff;
  --bs-btn-disabled-bg: #212529;
  --bs-btn-disabled-border-color: #212529;
}

.btn-link {
  --bs-btn-font-weight: 400;
  --bs-btn-color: var(--bs-link-color);
  --bs-btn-bg: transparent;
  --bs-btn-border-color: transparent;
  --bs-btn-hover-color: var(--bs-link-hover-color);
  --bs-btn-hover-bg: #424649;
  --bs-btn-hover-border-color: transparent;
  --bs-btn-active-color: var(--bs-link-hover-color);
  --bs-btn-active-border-color: transparent;
  --bs-btn-disabled-color: #6c757d;
  --bs-btn-disabled-border-color: transparent;
  --bs-btn-box-shadow: none;
  --bs-btn-focus-shadow-rgb: 49,132,253;
}

.btn-outline-primary {
  --bs-btn-color: #0d6efd;
  --bs-btn-border-color: #0d6efd;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #0d6efd;
  --bs-btn-hover-border-color: #0d6efd;
  --bs-btn-focus-shadow-rgb: 13,110,253;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #0d6efd;
  --bs-btn-active-border-color: #0d6efd;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #0d6efd;
  --bs-btn-disabled-bg: transparent;
  --bs-btn-disabled-border-color: #0d6efd;
  --bs-gradient: none;
}

.btn-outline-secondary {
  --bs-btn-color: #6c757d;
  --bs-btn-border-color: #6c757d;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #6c757d;
  --bs-btn-hover-border-color: #6c757d;
  --bs-btn-focus-shadow-rgb: 108,117,125;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #6c757d;
  --bs-btn-active-border-color: #6c757d;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #6c757d;
  --bs-btn-disabled-bg: transparent;
  --bs-btn-disabled-border-color: #6c757d;
  --bs-gradient: none;
}

.btn-outline-success {
  --bs-btn-color: #198754;
  --bs-btn-border-color: #198754;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #198754;
  --bs-btn-hover-border-color: #198754;
  --bs-btn-focus-shadow-rgb: 25,135,84;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #198754;
  --bs-btn-active-border-color: #198754;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #198754;
  --bs-btn-disabled-bg: transparent;
  --bs-btn-disabled-border-color: #198754;
  --bs-gradient: none;
}

.btn-outline-danger {
  --bs-btn-color: #dc3545;
  --bs-btn-border-color: #dc3545;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #dc3545;
  --bs-btn-hover-border-color: #dc3545;
  --bs-btn-focus-shadow-rgb: 220,53,69;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #dc3545;
  --bs-btn-active-border-color: #dc3545;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #dc3545;
  --bs-btn-disabled-bg: transparent;
  --bs-btn-disabled-border-color: #dc3545;
  --bs-gradient: none;
}

.btn-outline-warning {
  --bs-btn-color: #ffc107;
  --bs-btn-border-color: #ffc107;
  --bs-btn-hover-color: #000;
  --bs-btn-hover-bg: #ffc107;
  --bs-btn-hover-border-color: #ffc107;
  --bs-btn-focus-shadow-rgb: 255,193,7;
  --bs-btn-active-color: #000;
  --bs-btn-active-bg: #ffc107;
  --bs-btn-active-border-color: #ffc107;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #ffc107;
  --bs-btn-disabled-bg: transparent;
  --bs-btn-disabled-border-color: #ffc107;
  --bs-gradient: none;
}

.btn-outline-info {
  --bs-btn-color: #0dcaf0;
  --bs-btn-border-color: #0dcaf0;
  --bs-btn-hover-color: #000;
  --bs-btn-hover-bg: #0dcaf0;
  --bs-btn-hover-border-color: #0dcaf0;
  --bs-btn-focus-shadow-rgb: 13,202,240;
  --bs-btn-active-color: #000;
  --bs-btn-active-bg: #0dcaf0;
  --bs-btn-active-border-color: #0dcaf0;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #0dcaf0;
  --bs-btn-disabled-bg: transparent;
  --bs-btn-disabled-border-color: #0dcaf0;
  --bs-gradient: none;
}

.btn-outline-light {
  --bs-btn-color: #f8f9fa;
  --bs-btn-border-color: #f8f9fa;
  --bs-btn-hover-color: #000;
  --bs-btn-hover-bg: #f8f9fa;
  --bs-btn-hover-border-color: #f8f9fa;
  --bs-btn-focus-shadow-rgb: 248,249,250;
  --bs-btn-active-color: #000;
  --bs-btn-active-bg: #f8f9fa;
  --bs-btn-active-border-color: #f8f9fa;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #f8f9fa;
  --bs-btn-disabled-bg: transparent;
  --bs-btn-disabled-border-color: #f8f9fa;
  --bs-gradient: none;
}

.btn-outline-dark {
  --bs-btn-color: #212529;
  --bs-btn-border-color: #212529;
  --bs-btn-hover-color: #fff;
  --bs-btn-hover-bg: #212529;
  --bs-btn-hover-border-color: #212529;
  --bs-btn-focus-shadow-rgb: 33,37,41;
  --bs-btn-active-color: #fff;
  --bs-btn-active-bg: #212529;
  --bs-btn-active-border-color: #212529;
  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);
  --bs-btn-disabled-color: #212529;
  --bs-btn-disabled-bg: transparent;
  --bs-btn-disabled-border-color: #212529;
  --bs-gradient: none;
}

.btn-sm {
  --bs-btn-padding-y: 0.25rem;
  --bs-btn-padding-x: 0.5rem;
  --bs-btn-font-size: 0.875rem;
  --bs-btn-border-radius: 0.25rem;
}

.btn {
  display: flex;
  padding: var(--bs-btn-padding-y) var(--bs-btn-padding-x);
  font-family: var(--bs-btn-font-family);
  font-size: var(--bs-btn-font-size);
  font-weight: var(--bs-btn-font-weight);
  line-height: var(--bs-btn-line-height);
  color: var(--bs-btn-color);
  text-align: center;
  text-decoration: none;
  align-items: center;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
  border: var(--bs-btn-border-width) solid var(--bs-btn-border-color);
  border-radius: var(--bs-btn-border-radius);
  background-color: var(--bs-btn-bg);
  transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;
  transition-timing-function: ease-in;
}

.btn.disabled, .btn:disabled {
  color: var(--bs-btn-disabled-color);
  pointer-events: none;
  background-color: var(--bs-btn-disabled-bg);
  border-color: var(--bs-btn-disabled-border-color);
  opacity: var(--bs-btn-disabled-opacity);
}

[type="button"]:not(:disabled), [type="reset"]:not(:disabled), [type="submit"]:not(:disabled), button:not(:disabled) {
  cursor: pointer;
}

.btn:hover {
  color: var(--bs-btn-hover-color);
  background-color: var(--bs-btn-hover-bg);
  border-color: var(--bs-btn-hover-border-color);
}

.btn:focus-visible {
  color: var(--bs-btn-hover-color);
  background-color: var(--bs-btn-hover-bg);
  border-color: var(--bs-btn-hover-border-color);
  outline: 0;
  box-shadow: var(--bs-btn-focus-box-shadow);
}

.btn-link {
  text-decoration: underline;
}

.btn-check:checked + .btn, .btn.active, .btn.show, .btn:first-child:active, :not(.btn-check) + .btn:active {
  color: var(--bs-btn-active-color);
  background-color: var(--bs-btn-active-bg);
  border-color: var(--bs-btn-active-border-color);
}

.btn-check:checked + .btn:focus-visible, .btn.active:focus-visible, .btn.show:focus-visible, .btn:first-child:active:focus-visible, :not(.btn-check) + .btn:active:focus-visible {
  box-shadow: var(--bs-btn-focus-box-shadow);
}

.btn .icon {
  margin-right: 0.25rem;
}

.spinner-border, .spinner-grow {
  display: inline-block;
  width: var(--bs-spinner-width);
  height: var(--bs-spinner-height);
  vertical-align: var(--bs-spinner-vertical-align);
  border-radius: 50%;
  margin-right: 0.25rem;
  animation: var(--bs-spinner-animation-speed) linear infinite var(--bs-spinner-animation-name);
}

.spinner-border {
  --bs-spinner-width: 2rem;
  --bs-spinner-height: 2rem;
  --bs-spinner-vertical-align: -0.125em;
  --bs-spinner-border-width: 0.25em;
  --bs-spinner-animation-speed: 0.75s;
  --bs-spinner-animation-name: spinner-border;
  border: var(--bs-spinner-border-width) solid currentcolor;
  border-right-color: transparent;
  animation: 0.75s linear infinite spinner-border;
}

.spinner-border-sm {
  --bs-spinner-width: 1rem;
  --bs-spinner-height: 1rem;
  --bs-spinner-border-width: 0.2em;
}

@keyframes spinner-border {
  to { transform: rotate(360deg); }
}

.spinner-grow {
  --bs-spinner-width: 2rem;
  --bs-spinner-height: 2rem;
  --bs-spinner-vertical-align: -0.125em;
  --bs-spinner-animation-speed: 0.75s;
  --bs-spinner-animation-name: spinner-grow;
  background-color: currentcolor;
  opacity: 0;
  animation: 0.75s linear infinite spinner-grow;
}

.spinner-grow-sm {
  --bs-spinner-width: 1rem;
  --bs-spinner-height: 1rem;
}

@keyframes spinner-grow {
  0% {
    transform: scale(0);
  }
  50% {
    opacity: 1;
    transform: none;
  }
}
</style>

<script lang="js">
const variants = [
  'none', 'primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark', 'link', 
  'outline-primary', 'outline-secondary', 'outline-success', 'outline-danger', 'outline-warning', 
  'outline-info', 'outline-light', 'outline-dark'
];

export default {
  name: 'bs-button',
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      required: false,
      default: false
    },
    small: {
      type: Boolean,
      default: false
    },
    variant: {
      type: String,
      default: 'none',
      validator: v => !!~variants.indexOf(v),
    },
    type: {
      type: String,
      default: 'button',
      validator: v => !!~['button', 'reset', 'submit'].indexOf(v),
    },
    href: {
      type: String
    },
    toggle: {
      type: Boolean,
      default: false,
    },
    pressed: {
      type: Boolean,
      default: false,
    }, 
    spinnerStyle: {
      type: String,
      default: 'border',
      validator: v => !!~[ 'border', 'grow' ].indexOf(v),
    }
  },
  emits: [ 'click' ],
  data() {
    return {
      active: this.pressed
    };
  },
  computed: {
    tagName() {
      return this.href ? 'a' : 'button';
    },
    variantClass() {
      return this.variant == 'none' ? '' : `btn-${this.variant}`;
    },
    attrs() {
      const attrs = { type: this.type };
      if (this.disabled || this.loading) {
        attrs.disabled = true;
        attrs['aria-disabled'] = true;
      }
      
      if (this.href) {
        attrs.href = this.href;
        attrs.role = 'button';
      }

      if (this.toggle) {
        attrs['data-bs-toggle'] = true;
      }

      if (this.pressed) {
        attrs['aria-pressed'] = true;
      }
      return attrs;
    },
  },
  methods: {
    handleClick(e) {
      if (this.toggle) {
        const active = this.active;
        this.active = !active;
      }
      this.$emit('click', e);
    }
  }
}
</script>