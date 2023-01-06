// https://github.com/nkashyap/console.io/blob/master/src/client/stacktrace.js
// https://github.com/nkashyap/console.io/blob/master/src/client/formatter.js

function getType(data) {
  return Object.prototype.toString.apply(data).replace('[object ', '').replace(']', '');
}

/**
 * Given arguments array as a String, subsituting type names for non-string types.
 *
 * @param {Arguments} args
 * @return {Array} of Strings with stringified arguments
 */
export function stringifyArguments(args) {
  const result = [];
  const slice = Array.prototype.slice;

  for (let i = 0; i < args.length; ++i) {
    const arg = args[i];
    if (arg === undefined) {
      result[i] = 'undefined';
    } else if (arg === null) {
      result[i] = 'null';
    } else if (arg.constructor) {
      if (arg.constructor === Array) {
        if (arg.length < 3) {
          result[i] = '[' + stringifyArguments(arg) + ']';
        } else {
          result[i] = '[' + stringifyArguments(slice.call(arg, 0, 1)) + '...' + stringifyArguments(slice.call(arg, -1)) + ']';
        }
      } else if (arg.constructor === Object) {
        result[i] = '#object';
      } else if (arg.constructor === Function) {
        result[i] = '#function';
      } else if (arg.constructor === String) {
        result[i] = '"' + arg + '"';
      } else if (arg.constructor === Number) {
        result[i] = arg;
      }
    }
  }

  return result.join(",");
}

const formatter = {
  chrome(e) {
    const stack = (e.stack + '\n').replace(/^\S[^\(]+?[\n$]/gm, '').
      replace(/^\s+(at eval )?at\s+/gm, '').
      replace(/^([^\(]+?)([\n$])/gm, '{anonymous}()@$1$2').
      replace(/^Object.<anonymous>\s*\(([^\)]+)\)/gm, '{anonymous}()@$1').split('\n');
    stack.pop();
    return stack;
  },

  safari(e) {
    return e.stack.replace(/\[native code\]\n/m, '')
      .replace(/^(?=\w+Error\:).*$\n/m, '')
      .replace(/^@/gm, '{anonymous}()@')
      .split('\n');
  },

  ie(e) {
    var lineRE = /^.*at (\w+) \(([^\)]+)\)$/gm;
    return e.stack.replace(/at Anonymous function /gm, '{anonymous}()@')
      .replace(/^(?=\w+Error\:).*$\n/m, '')
      .replace(lineRE, '$1@$2')
      .split('\n');
  },

  firefox(e) {
    return e.stack.replace(/(?:\n@:0)?\s+$/m, '').replace(/^[\(@]/gm, '{anonymous}()@').split('\n');
  },

  opera11(e) {
    const ANON = '{anonymous}';
    const lineRE = /^.*line (\d+), column (\d+)(?: in (.+))? in (\S+):$/;
    const lines = e.stacktrace.split('\n');
    const result = [];

    for (let i = 0, len = lines.length; i < len; i += 2) {
      const match = lineRE.exec(lines[i]);
      if (match) {
        const location = match[4] + ':' + match[1] + ':' + match[2];
        let fnName = match[3] || "global code";
        fnName = fnName.replace(/<anonymous function: (\S+)>/, "$1").replace(/<anonymous function>/, ANON);
        result.push(fnName + '@' + location + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
      }
    }

    return result;
  },

  opera10b(e) {
    // "<anonymous function: run>([arguments not available])@file://localhost/G:/js/stacktrace.js:27\n" +
    // "printStackTrace([arguments not available])@file://localhost/G:/js/stacktrace.js:18\n" +
    // "@file://localhost/G:/js/test/functional/testcase1.html:15"
    const lineRE = /^(.*)@(.+):(\d+)$/;
    const lines = e.stacktrace.split('\n');
    const result = [];

    for (let i = 0, len = lines.length; i < len; i++) {
      const match = lineRE.exec(lines[i]);
      if (match) {
        const fnName = match[1] ? (match[1] + '()') : "global code";
        result.push(fnName + '@' + match[2] + ':' + match[3]);
      }
    }

    return result;
  },

  opera10a(e) {
    // "  Line 27 of linked script file://localhost/G:/js/stacktrace.js\n"
    // "  Line 11 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html: In function foo\n"
    const ANON = '{anonymous}';
    const lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
    const lines = e.stacktrace.split('\n');
    const result = [];

    for (let i = 0, len = lines.length; i < len; i += 2) {
      const match = lineRE.exec(lines[i]);
      if (match) {
        const fnName = match[3] || ANON;
        result.push(fnName + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
      }
    }

    return result;
  },

  opera9(e) {
    // "  Line 43 of linked script file://localhost/G:/js/stacktrace.js\n"
    // "  Line 7 of inline#1 script in file://localhost/G:/js/test/functional/testcase1.html\n"
    const ANON = '{anonymous}';
    const lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
    const lines = e.message.split('\n');
    const result = [];

    for (let i = 2, len = lines.length; i < len; i += 2) {
      const match = lineRE.exec(lines[i]);
      if (match) {
        result.push(ANON + '()@' + match[2] + ':' + match[1] + ' -- ' + lines[i + 1].replace(/^\s+/, ''));
      }
    }

    return result;
  },

  other(curr) {
    const ANON = '{anonymous}';
    const fnRE = /function\s*([\w\-$]+)?\s*\(/i;
    const stack = [];
    const maxStackSize = 10;
    while (curr && curr['arguments'] && stack.length < maxStackSize) {
      const matches = curr.toString().match(fnRE);
      const fn = matches ? matches[1] || ANON : ANON;
      const args = Array.prototype.slice.call(curr['arguments'] || []);
      stack[stack.length] = fn + '(' + stringifyArguments(args) + ')';
      curr = curr.caller;
    }
    return stack;
  },
};

const stackTrace = {
  allowedErrorStackLookUp: ['Error', 'ErrorEvent', 'DOMException', 'PositionError'],

  getFormatter(e) {
    if (e['arguments'] && e.stack) {
      return formatter.chrome;

    } else if (e.stack && e.sourceURL) {
      return formatter.safari;

    } else if (e.stack && e.number) {
      return formatter.ie;

    } else if (typeof e.message === 'string' && typeof window !== 'undefined' && window.opera) {
      if (!e.stacktrace) {
        return formatter.opera9;
      }

      if (e.message.indexOf('\n') > -1 && e.message.split('\n').length > e.stacktrace.split('\n').length) {
        return formatter.opera9;
      }

      if (!e.stack) {
        return formatter.opera10a;
      }

      if (e.stacktrace.indexOf("called from line") < 0) {
        return formatter.opera10b;
      }

      return formatter.opera11;

    } else if (e.stack) {
      return formatter.firefox;
    }

    return 'other';
  },

  create(message) {
    try {
      throw new Error(message);
    } catch (e) {
      // remove error string from stack
      e.stack = e.stack.replace("Error: ", "");
      return e;
    }
  },

  get(e) {
    const formatterFn = this.getFormatter(e);
    if (typeof formatterFn === 'function') {
      return formatterFn(e);
    } else {
      const errorClass = getType(e);
      if (!~stackTrace.allowedErrorStackLookUp.indexOf(errorClass)) {
        return errorClass + ' is missing from "stacktrace.allowedErrorStackLookUp[' + stackTrace.allowedErrorStackLookUp.join(',') + ']";';
      }

      return formatter.other(arguments.callee);
    }
  },
};

export default stackTrace;