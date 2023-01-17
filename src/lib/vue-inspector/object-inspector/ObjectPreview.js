import { defineComponent, h } from 'vue';

import ObjectName from '../object/ObjectName.js';
import ObjectValue from '../object/ObjectValue.js';

import { hasOwnProperty, getPropertyValue } from '../utils';

/* intersperse arr with separator */
function intersperse(arr, sep) {
  if (arr.length === 0) {
    return [];
  }

  return arr.slice(1).reduce((xs, x) => xs.concat([sep, x]), [arr[0]]);
}

export default {
  name: 'ObjectPreview',
  components: {
    ObjectName,
    ObjectValue
  },
  props: {
    data: {
      required: false,
    },
    arrayMaxProperties: {
      type: Number,
      default: 10,
    },
    objectMaxProperties: {
      type: Number,
      default: 5,
    },
  },
  render() {
    const data = this.data;

    if (typeof data !== 'object' || data === null || data instanceof Date || data instanceof RegExp) {
      return h(ObjectValue, { data: data });
    }

    if (Array.isArray(data)) {
      const maxProperties = this.arrayMaxProperties;
      const previewArray = data
        .slice(0, maxProperties)
        .map((element, index) => h(ObjectValue, { key: index, data: element }));

      if (data.length > maxProperties) {
        previewArray.push(h('span', { key: 'ellipsis' }, '…'));
      }
      const arrayLength = data.length;
      return [
        h('span', { class: 'object-description' }, arrayLength === 0 ? '' : `(${arrayLength})\xa0`),
        h('span', { class: 'preview' }, [ '[ ', ...intersperse(previewArray, ', '), ' ]'])
      ];

    } else {
      const maxProperties = this.objectMaxProperties;
      const propertyNodes = [];

      for (const propertyName in data) {
        if (hasOwnProperty.call(data, propertyName)) {
          let ellipsis = undefined;
          if (propertyNodes.length === maxProperties - 1 && Object.keys(data).length > maxProperties) {
            ellipsis = h('span', { key: 'ellipsis' }, '…');
          }

          const propertyValue = getPropertyValue(data, propertyName);
          propertyNodes.push(
            h('span', { key: propertyName }, [
              h(ObjectName, { name: propertyName || `""` }),
              ': ',
              h(ObjectValue, { data: propertyValue }),
              ellipsis
            ])
          );

          if (ellipsis) break;
        }
      }

      const objectConstructorName = data.constructor ? data.constructor.name : 'Object';
      return [
        h('span', { class: 'object-description' }, objectConstructorName === 'Object' ? '' : `${objectConstructorName} `),
        h('span', { class: 'preview' }, [ '{ ', ...intersperse(propertyNodes, ', '), ' }' ])
      ];
    }
  }
};