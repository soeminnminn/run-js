// Sandbox HTML elements
let sandbox;
function getSandbox() {
  return (sandbox ||= document.implementation.createHTMLDocument('sandbox'));
}

function objectifyAttributes(element) {
  const data = {};
  for (let attribute of element.attributes) {
    data[attribute.name] = attribute.value;
  }
  return data;
}

/**
 * Serialize a HTML element into JSON
 */
export default {
  type: 'HTMLElement',
  shouldTransform(type, obj) {
    return (
      obj &&
      obj.children &&
      typeof obj.innerHTML === 'string' &&
      typeof obj.tagName === 'string'
    )
  },
  toSerializable(element) {
    return {
      tagName: element.tagName.toLowerCase(),
      attributes: objectifyAttributes(element),
      innerHTML: element.innerHTML,
    };
  },
  fromSerializable(data) {
    try {
      const element = getSandbox().createElement(data.tagName);
      element.innerHTML = data.innerHTML;
      for (let attribute of Object.keys(data.attributes)) {
        try {
          element.setAttribute(attribute, data.attributes[attribute]);
        } catch (e) {}
      }
      return element;
    } catch (e) {
      return data;
    }
  },
}
