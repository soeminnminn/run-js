/**
 * Serialize a function into JSON
 */
export default {
  type: 'Function',
  lookup: Function,
  shouldTransform(type, obj) {
    return typeof obj === 'function';
  },
  toSerializable(func) {
    let body = ''
    try {
      body = func
        .toString()
        .substring(body.indexOf('{') + 1, body.lastIndexOf('}'));
    } catch (e) {}

    return {
      name: func.name,
      body,
      proto: Object.getPrototypeOf(func).constructor.name,
    };
  },
  fromSerializable(data) {
    try {
      const tempFunc = function () {};

      if (typeof data.name === 'string') {
        Object.defineProperty(tempFunc, 'name', {
          value: data.name,
          writable: false,
        });
      }

      if (typeof data.body === 'string') {
        Object.defineProperty(tempFunc, 'body', {
          value: data.body,
          writable: false,
        });
      }

      if (typeof data.proto === 'string') {
        tempFunc.constructor = {
          name: data.proto,
        };
      }

      return tempFunc;
    } catch (e) {
      return data;
    }
  },
}