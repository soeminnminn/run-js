export const hasOwnProperty = Object.prototype.hasOwnProperty;
export const propertyIsEnumerable = Object.prototype.propertyIsEnumerable;

export function getPropertyValue(object, propertyName) {
  const propertyDescriptor = Object.getOwnPropertyDescriptor(object, propertyName);
  if (propertyDescriptor.get) {
    try {
      return propertyDescriptor.get();
    } catch {
      return propertyDescriptor.get;
    }
  }

  return object[propertyName];
}

function isObject(x) {
  return typeof x === 'object' && x !== null;
}

function isWindow(obj) {
  if (obj == null) {
    return false;
  }

  const o = Object(obj);
  return o === o.window;
}

export function isNode(val) {
  if (!isObject(val) || !isWindow(window) || typeof window.Node !== 'function') {
    return false;
  }
  return typeof val.nodeType === 'number' && typeof val.nodeName === 'string';
}