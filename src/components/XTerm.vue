<template>
  <div class="terminal-container"></div>
</template>

<style scoped>
.terminal-container {
  display: inline-block;
  position: relative;
  margin: 0;
  background: #1b212f;
  width: 100%;
  height: 100%;
}
</style>

<script lang="js">
// https://github.com/lflxp/gin-xterm/blob/master/src/views/pty/xterm3.vue
import { Terminal } from 'xterm';
import '~xterm/css/xterm.css';

const MINIMUM_COLS = 2;
const MINIMUM_ROWS = 1;

const DEFAULT_COLS = 40;
const DEFAULT_ROWS = 20;

function proposeDimensions(terminal) {
  if (!terminal) {
    return undefined;
  }

  if (!terminal.element || !terminal.element.parentElement) {
    return undefined;
  }

  const core = terminal._core;

  if (core._renderService.dimensions.actualCellWidth === 0 || core._renderService.dimensions.actualCellHeight === 0) {
    return undefined;
  }

  const scrollbarWidth = terminal.options.scrollback === 0 ?
    0 : core.viewport.scrollBarWidth;

  const parentElementStyle = window.getComputedStyle(terminal.element.parentElement);
  const parentElementHeight = parseInt(parentElementStyle.getPropertyValue('height'));
  const parentElementWidth = Math.max(0, parseInt(parentElementStyle.getPropertyValue('width')));
  const elementStyle = window.getComputedStyle(terminal.element);
  const elementPadding = {
    top: parseInt(elementStyle.getPropertyValue('padding-top')),
    bottom: parseInt(elementStyle.getPropertyValue('padding-bottom')),
    right: parseInt(elementStyle.getPropertyValue('padding-right')),
    left: parseInt(elementStyle.getPropertyValue('padding-left'))
  };
  const elementPaddingVer = elementPadding.top + elementPadding.bottom;
  const elementPaddingHor = elementPadding.right + elementPadding.left;
  const availableHeight = parentElementHeight - elementPaddingVer;
  const availableWidth = parentElementWidth - elementPaddingHor - scrollbarWidth;
  const geometry = {
    cols: Math.max(MINIMUM_COLS, Math.floor(availableWidth / core._renderService.dimensions.actualCellWidth)),
    rows: Math.max(MINIMUM_ROWS, Math.floor(availableHeight / core._renderService.dimensions.actualCellHeight))
  };
  return geometry;
}

const defaultTheme = {
  foreground: '#ffffff',
  background: '#1b212f',
  cursor: '#ffffff',
  selection: 'rgba(255, 255, 255, 0.3)',
  black: '#000000',
  brightBlack: '#808080',
  red: '#ce2f2b',
  brightRed: '#f44a47',
  green: '#00b976',
  brightGreen: '#05d289',
  yellow: '#e0d500',
  brightYellow: '#f4f628',
  magenta: '#bd37bc',
  brightMagenta: '#d86cd8',
  blue: '#1d6fca',
  brightBlue: '#358bed',
  cyan: '#00a8cf',
  brightCyan: '#19b8dd',
  white: '#e5e5e5',
  brightWhite: '#ffffff'
};

const emiatables = {
  'onBell': 'bell',
  'onBinary': 'binary',
  'onCursorMove': 'cursorMove',
  'onData': 'data',
  'onKey': 'key',
  'onLineFeed': 'lineFeed',
  'onRender': 'render',
  'onWriteParsed': 'writeParsed',
  'onResize': 'resize',
  'onScroll': 'scroll',
  'onSelectionChange': 'selectionChange',
  'onTitleChange': 'titleChange',
}

export default {
  name: 'xterm',
  props: {
    options: {
      type:Object,
      default: {}
    },
    autoFit: {
      type: Boolean,
      default: true
    },
  },
  data() {
    return {
      size: 0,
      resizeObserver: null,
      xterm: null,
    }
  },
  emits: [
    'initialized',
    'bell',
    'binary',
    'cursorMove',
    'data',
    'key',
    'lineFeed',
    'render',
    'writeParsed',
    'resize',
    'scroll',
    'selectionChange',
    'titleChange',
  ],
  computed: {
    element() {
      return this.xterm.element;
    },
    textarea() {
      return this.xterm.textarea;
    },
    rows() {
      return this.xterm.rows || this.options.rows || DEFAULT_ROWS;
    },
    cols() {
      return this.xterm.cols || this.options.cols || DEFAULT_COLS;
    },
    buffer() {
      return this.xterm.buffer;
    },
    markers() {
      return this.xterm.markers;
    },
    parser() {
      return this.xterm.parser;
    },
    unicode() {
      return this.xterm.unicode;
    },
    modes() {
      return this.xterm.modes;
    },
  },
  watch: {
    options: {
      handler(options) {
        if(this.xterm) {
          const keys = Object.keys(options);
          for(const i in keys) {
            const key = keys[i];
            if (!!~['cols', 'rows'].indexOf(key)) continue;
            this.xterm.options[key] = options[key];
          }
        }
      },
      deep: true
    },
    autoFit(autoFit) {
      if (autoFit == true) {
        this.fit();
      } else {
        const cols = this.options.rows || DEFAULT_COLS;
        const rows = this.options.rows || DEFAULT_ROWS;
        this.resize(cols, rows);
      }
    },
  },
  mounted() {
    this.$nextTick(this.init());
  },
  beforeUnmount() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.xterm) {
      this.xterm.dispose();
    }
  },
  methods: {
    init() {
      const xterm = new Terminal({
        allowProposedApi: true,
        theme: defaultTheme,
        rows: DEFAULT_ROWS,
        cols: DEFAULT_COLS,
        convertEol: true,
        scrollback: 10,
        disableStdin: false,
        fontSize: 16,
        cursorBlink: true,
        cursorStyle: 'bar',
        ...(this.options)
      });

      const emit = (event, args) => {
        this.$emit(event, args);
      }
      const events = Object.keys(emiatables);
      for(const i in events) {
        const key = events[i];
        xterm[key](function() {
          emit(emiatables[key], arguments);
        });
      }

      xterm.writeln('Welcome to \x1B[1;3;31mxterm\x1B[0m');
      xterm.open(this.$el);

      this.resizeObserver = new window.ResizeObserver(this.onResize.bind(this));
      this.size = this.$el.offsetWidth * this.$el.offsetHeight;
      this.resizeObserver.observe(this.$el);
      
      this.xterm = xterm;
      emit('initialized', this.xterm);

      if (this.autoFit) {
        this.fit();
      }
    },
    onResize() {
      const newSize = this.$el.offsetWidth * this.$el.offsetHeight;
      if (this.size != newSize) {
        this.size = newSize;
        if (this.autoFit) {
          this.fit();
        }
      }
    },
    blur() {
      if (this.xterm) {
        this.xterm.blur();
      }
    },
    focus() {
      if (this.xterm) {
        this.xterm.focus();
      }
    },
    fit() {
      const dims = proposeDimensions(this.xterm);
      if (!dims || !this.xterm || isNaN(dims.cols) || isNaN(dims.rows)) {
        return;
      }
      this.resize(dims.cols, dims.rows);
    },
    resize(cols, rows) {
      if (!this.xterm || isNaN(cols) || isNaN(rows)) {
        return;
      }
      const core = this.xterm._core;

      // Force a full render
      if (this.xterm.rows !== rows || this.xterm.cols !== cols) {
        if (core) {
          core._renderService.clear();
        }
        this.xterm.resize(cols, rows);
      }
    },
    attachCustomKeyEventHandler(customKeyEventHandler) {
      if (this.xterm) {
        this.xterm.attachCustomKeyEventHandler(customKeyEventHandler);
      }
    },
    registerLinkProvider(linkProvider) {
      if (this.xterm) {
        return this.xterm.registerLinkProvider(linkProvider);
      }
      throw new Error('Terminal not initialized!');
    },
    registerCharacterJoiner(handler) {
      if (this.xterm) {
        return this.xterm.registerCharacterJoiner(handler);
      }
      throw new Error('Terminal not initialized!');
    },
    deregisterCharacterJoiner(joinerId) {
      if (this.xterm) {
        this.xterm.deregisterCharacterJoiner(joinerId);
      }
    },
    registerMarker(cursorYOffset) {
      if (this.xterm) {
        return this.xterm.registerMarker(cursorYOffset);
      }
      throw new Error('Terminal not initialized!');
    },
    registerDecoration(decorationOptions) {
      if (this.xterm) {
        return this.xterm.registerDecoration(decorationOptions);
      }
      throw new Error('Terminal not initialized!');
    },
    hasSelection() {
      if (this.xterm) {
        return this.xterm.hasSelection();
      }
      return false;
    },
    getSelection() {
      if (this.xterm) {
        return this.xterm.getSelection();
      }
      return null;
    },
    getSelectionPosition() {
      if (this.xterm) {
        return this.xterm.getSelection();
      }
      return undefined;
    },
    clearSelection() {
      if (this.xterm) {
        this.xterm.clearSelection();
      }
    },
    select(column, row, length) {
      if (this.xterm) {
        this.xterm.select(column, row, length);
      }
    },
    selectAll() {
      if (this.xterm) {
        this.xterm.selectAll();
      }
    },
    selectLines(start, end) {
      if (this.xterm) {
        this.xterm.selectLines(start, end);
      }
    },
    scrollLines(amount) {
      if (this.xterm) {
        this.xterm.scrollLines(amount);
      }
    },
    scrollPages(pageCount) {
      if (this.xterm) {
        this.xterm.scrollPages(pageCount);
      }
    },
    scrollToTop() {
      if (this.xterm) {
        this.xterm.scrollToTop();
      }
    },
    scrollToBottom() {
      if (this.xterm) {
        this.xterm.scrollToBottom();
      }
    },
    scrollToLine(line) {
      if (this.xterm) {
        this.xterm.scrollToLine(line);
      }
    },
    clear() {
      if (this.xterm) {
        this.xterm.clear();
      }
    },
    write(data, callback) {
      if (this.xterm) {
        this.xterm.write(data, callback);
      }
    },
    writeln(data, callback) {
      if (this.xterm) {
        this.xterm.writeln(data, callback);
      }
    },
    paste(data) {
      if (this.xterm) {
        this.xterm.paste(data);
      }
    },
    refresh(start, end) {
      if (this.xterm) {
        this.xterm.refresh(start, end);
      }
    },
    clearTextureAtlas() {
      if (this.xterm) {
        this.xterm.clearTextureAtlas();
      }
    },
    reset() {
      if (this.xterm) {
        this.xterm.reset();
      }
    },
    loadAddon(addon) {
      if (this.xterm) {
        this.xterm.loadAddon(addon);
      }
    },
  },
}
</script>