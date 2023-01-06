import stackTrace from "./stacktrace";

function validateWritable(writable) {
  if (writable && typeof(writable) == 'object' && typeof(writable.write) == 'function') {
    return true;
  }
  throw new Error('writable must be object with write function');
}

export default class Console {

  constructor(writable) {
    validateWritable(writable);

    this.writable = writable;

    this._counters = {};
    this._timeCounters = {};
    this._groups = {
      '_GLOBAL_': 0,
      last: '_GLOBAL_'
    };
    this._commands = [];
  }

  _send(command, message, data, extra) {
    const level = this._groups[this._groups.last];
    const cmd = { command, messages: [], level, extra };

    if (message) {
      cmd.messages.push(message);
    }
    
    if (data && data.length && typeof(data[0]) !== 'object') {
      cmd.messages.push(data[0]);
      data.splice(0, 1);
      cmd.data = data;
    }

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

      this._send('assert', 'Assertion failed', data, { trace: traceList });

    } else {
      this._send('assert', 'Assertion OK', data);
    }
  }
  
  clear() {
    this._counters = {};
    this._timeCounters = {};
    this._groups = {
      '_GLOBAL_': 0,
      last: '_GLOBAL_'
    };
    this._commands = [];

    this._send('clear');
  }
  
  count(label) {
    const key = label ? `KEY${label}` : '_GLOBAL_';
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
      const key = `KEY${label}`
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
    this._send('dir', undefined, undefined, item);
  }
  
  dirxml(item) {
    this._send('dirxml', undefined, undefined, item);
  }
  
  error(...data) {
    if (data && data.length) {
      const idx = data.findIndex(x => x instanceof Error);
      if (idx > -1) {
        const e = data[idx]
        const traceList = stackTrace.get(e);
        data[idx] = e.message;
        this._send('error', undefined, data, { trace: traceList });
        return;
      }      
    }
    this._send('error', undefined, data);
  }
  
  group(label) {
    const key = label ? `KEY${label}` : '_GLOBAL_';
    this._groups[key] = Math.max(0, this._groups[key]--);
    this._groups.last = key;

    this._send('group');
  }
  
  groupCollapsed(label) {
    const key = label ? `KEY${label}` : '_GLOBAL_';
    this._groups[key] = Math.max(0, this._groups[key]--);
    this._groups.last = key;

    this._send('groupCollapsed', undefined, undefined, { collapsed: true });
  }
  
  groupEnd() {
    const key = this._groups.last;
    this._groups[key] = Math.max(0, this._groups[key]--);

    this._send('groupEnd');
  }
  
  info(...data) {
    this._send('info', undefined, data);
  }
  
  log(...data) {
    this._send('log', undefined, data);
  }
  
  profile(profileName) {
    this._send('profileEnd', undefined, undefined, { profileName });
  }
  
  profileEnd() {
    this._send('profileEnd');
  }
  
  table(tabularData, columns) {
    this._send('table', undefined, undefined, { tabularData, columns });
  }
  
  time(label) {
    const key = label ? `KEY${label}` : '_GLOBAL_';
    this.timeCounters[key] = (new Date()).getTime();

    this._send('time');
  }

  timeEnd(label) {
    const key = label ? `KEY${label}` : '_GLOBAL_';
    
    if (this._timeCounters[key]) {
      const timeCounter = this._timeCounters[key];
      delete(this._timeCounters[key]);

      this._send('timeEnd', `${label}: ${(new Date()).getTime() - timeCounter}ms - timer ended`);
    }
  }

  timeLog(label) {
    const key = label ? `KEY${label}` : '_GLOBAL_';

    if (this._timeCounters[key]) {
      const timeCounter = this._timeCounters[key];

      this._send('timeLog', `${label}: ${(new Date()).getTime() - timeCounter}ms`);
    }
  }

  timeStamp(label) {
    const key = label ? `KEY${label}` : '_GLOBAL_';
    this._timeCounters[key] = (new Date()).getTime();

    this._send('timeStamp');
  }

  trace(...data) {
    const traceList = stackTrace.get(stackTrace.create());
    this._send('trace', undefined, data, { trace: traceList.splice(0, 3) });
  }

  warn(...data) {
    this._send('warn', undefined, data);
  }
}