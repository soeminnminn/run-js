export function emitError(message) {
  throw new Error(`[VueJSONPretty] ${message}`);
}

export function getDataType(value) {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
}

export function jsonFlatten(data, path = 'root', level = 0, options) {
  const {
    key,
    index,
    type = 'content',
    showComma = false,
    length = 1,
  } = options || {};
  const dataType = getDataType(data);

  if (dataType === 'array') {
    const inner = arrFlat(
      data.map((item, idx, arr) =>
        jsonFlatten(item, `${path}[${idx}]`, level + 1, {
          index: idx,
          showComma: idx !== arr.length - 1,
          length,
          type,
        }),
      ),
    );
    return [
      jsonFlatten('[', path, level, {
        showComma: false,
        key,
        length: data.length,
        type: 'arrayStart',
      })[0],
    ].concat(
      inner,
      jsonFlatten(']', path, level, {
        showComma,
        length: data.length,
        type: 'arrayEnd',
      })[0],
    );
  } else if (dataType === 'object') {
    const keys = Object.keys(data);
    const inner = arrFlat(
      keys.map((objKey, idx, arr) =>
        jsonFlatten(
          data[objKey],
          /^[a-zA-Z_]\w*$/.test(objKey) ? `${path}.${objKey}` : `${path}["${objKey}"]`,
          level + 1,
          {
            key: objKey,
            showComma: idx !== arr.length - 1,
            length,
            type,
          },
        ),
      ),
    );
    return [
      jsonFlatten('{', path, level, {
        showComma: false,
        key,
        index,
        length: keys.length,
        type: 'objectStart',
      })[0],
    ].concat(
      inner,
      jsonFlatten('}', path, level, { showComma, length: keys.length, type: 'objectEnd' })[0],
    );
  }

  return [
    {
      content: data,
      level,
      key,
      index,
      path,
      showComma,
      length,
      type,
    },
  ];
}

export function arrFlat(arr) {
  if (typeof Array.prototype.flat === 'function') {
    return arr.flat();
  }
  const stack = [...arr];
  const result = [];
  while (stack.length) {
    const first = stack.shift();
    if (Array.isArray(first)) {
      stack.unshift(...first);
    } else {
      result.push(first);
    }
  }
  return result;
}