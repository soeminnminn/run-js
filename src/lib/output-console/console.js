import stackTrace from "./stacktrace";

const GLOBAL_KEY = '_GLOBAL_';

function validateWritable(writable) {
  if (writable && typeof(writable) == 'object' && typeof(writable.write) == 'function') {
    return true;
  }
  throw new Error('writable must be object with write function');
}

function getNumberStringWithWidth(num, width) {
  const str = num.toString();
  if (width > str.length) return '0'.repeat(width - str.length) + str;
  return str.substr(0, width);
}

export function getTimestamp() {
  const date = new Date();
  const h = getNumberStringWithWidth(date.getHours(), 2);
  const min = getNumberStringWithWidth(date.getMinutes(), 2);
  const sec = getNumberStringWithWidth(date.getSeconds(), 2);
  const ms = getNumberStringWithWidth(date.getMilliseconds(), 3);
  return `${h}:${min}:${sec}.${ms}`;
}

export default class Console {

  constructor(writable) {
    validateWritable(writable);

    this.writable = writable;

    this._counters = {};
    this._timeCounters = {};
    this._groups = {
      [GLOBAL_KEY]: 0,
      last: GLOBAL_KEY
    };
    this._profileName = undefined;
    this._commands = [];
  }

  _send(command, message, data, extra) {
    const level = this._groups[this._groups.last];
    const timestamp = getTimestamp();
    const cmd = { command, timestamp, message, level, profile: this._profileName, data: data || [], ...extra };
    this.writable.write(cmd);
  }

  assert(condition, ...data) {
    let result = false;
    let error = null;
    try {
      const fn = () => { return condition; };
      result = fn();
    } catch(e) {
      error = e;
    }

    if (!result) {
      let traceList = [];
      if (error instanceof Error) {
        traceList = stackTrace.get(error);
      } else {
        traceList = stackTrace.get(stackTrace.create());
        traceList.splice(0, 3);  
      }

      this._send('assert', 'Assertion failed', data, { method: 'error', trace: traceList });

    } else {
      this._send('assert', undefined, data, { method: 'success' });
    }
  }
  
  clear() {
    this._counters = {};
    this._timeCounters = {};
    this._groups = {
      [GLOBAL_KEY]: 0,
      last: GLOBAL_KEY
    };
    this._profileName = undefined;
    this._commands = [];

    this._send('clear');
  }
  
  count(label) {
    const key = label ? `KEY-${label}` : GLOBAL_KEY;
    let frameCounter = this._counters[key];

    if (!frameCounter) {
      this._counters[key] = frameCounter = {
        key: label || '',
        count: 1
      };
    } else {
      ++frameCounter.count;
    }

    this._send('count', `${label || ''}: ${frameCounter.count}`);
  }
  
  countReset(label) {
    if (!label) {
      Object.keys(this._counters).forEach(key => {
        this._counters[key].count = 0;  
      });
    } else {
      const key = `KEY-${label}`
      if (this._counters[key]) {
        this._counters[key].count = 0;
      }
    }
    this._send('countReset');
  }
  
  debug(...data) {
    this._send('debug', undefined, data);
  }
  
  dir(item) {
    this._send('dir', undefined, [ item ]);
  }
  
  dirxml(item) {
    this._send('dirxml', undefined, [ item ]);
  }
  
  error(...data) {
    if (data && data.length) {
      const idx = data.findIndex(x => x instanceof Error);
      if (idx > -1) {
        const e = data[idx];
        const traceList = stackTrace.get(e);
        data.splice(idx, 1);
        this._send('error', e.message, data, { trace: traceList });
        return;
      }
    }
    this._send('error', undefined, data);
  }
  
  group(label) {
    const key = label ? `KEY-${label}` : GLOBAL_KEY;
    if (this._groups[key]) {
      const value = this._groups[key];
      this._groups[key] = value;
    } else {
      this._groups[key] = 1;
    }
    this._groups.last = key;

    this._send('group');
  }
  
  groupCollapsed(label) {
    const key = label ? `KEY-${label}` : GLOBAL_KEY;
    if (this._groups[key]) {
      const value = this._groups[key];
      this._groups[key] = value + 1;
    } else {
      this._groups[key] = 1;
    }
    this._groups.last = key;

    this._send('groupCollapsed', undefined, undefined, { collapsed: true });
  }
  
  groupEnd() {
    const key = this._groups.last;
    if (this._groups[key]) {
      const value = this._groups[key];
      this._groups[key] = value - 1;
    }

    this._send('groupEnd');
  }
  
  info(...data) {
    this._send('info', undefined, data);
  }
  
  log(...data) {
    this._send('log', undefined, data);
  }
  
  profile(profileName) {
    this._profileName = profileName;
    this._send('profile');
  }
  
  profileEnd() {
    this._profileName = undefined;
    this._send('profileEnd');
  }
  
  table(tabularData, columns) {
    this._send('table', undefined, [ tabularData ], { columns });
  }
  
  time(label) {
    const key = label ? `KEY-${label}` : GLOBAL_KEY;
    this._timeCounters[key] = (new Date()).getTime();

    this._send('time');
  }

  timeEnd(label) {
    const key = label ? `KEY-${label}` : GLOBAL_KEY;
    
    if (this._timeCounters[key]) {
      const timeCounter = this._timeCounters[key];
      delete(this._timeCounters[key]);
      const message = `${(new Date()).getTime() - timeCounter}ms - timer ended`;

      this._send('timeEnd', label ? `${label}: ${message}` : `time: ${message}`);

    } else {
      const message = `Timer “${label}” doesn’t exist.`;
      this._send('timeEnd', message, undefined, { method: 'warn' });
    }
  }

  timeLog(label) {
    const key = label ? `KEY-${label}` : GLOBAL_KEY;
    
    if (this._timeCounters[key]) {
      const timeCounter = this._timeCounters[key];
      const message = `${(new Date()).getTime() - timeCounter}ms`;
      
      this._send('timeLog', label ? `${label}: ${message}` : `time: ${message}`);

    } else {
      const message = `Timer “${label}” doesn’t exist.`;
      this._send('timeLog', message, undefined, { method: 'warn' });
    }
  }

  timeStamp(label) {
    const message = getTimestamp();
    this._send('timeStamp', label ? `${label}: ${message}` : `time: ${message}`);
  }

  trace(...data) {
    const traceList = stackTrace.get(stackTrace.create());
    this._send('trace', undefined, data, { trace: traceList.splice(0, 3) });
  }

  warn(...data) {
    this._send('warn', undefined, data);
  }
}