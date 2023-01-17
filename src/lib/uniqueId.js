function timestampUUID() {
  const g = (n, r = '') => {
    for (let i = n; i--;) {
      r += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    }
    return r;
  }
  const { pid } = process || {
    pid: Math.floor(Math.random() * 63) 
  };

  let p = (Date.now() * 1e3);
  p++;
  const n = p.toString(36);
  let s = pid.toString(36);
  s = s + g(6 - s.length);

  const k = g(4);
  return s + n + k.substring(0, 12 - n.length);
}

export function randomID(blueprint, length) {
  if (typeof(blueprint) == 'number') {
    length = blueprint;
    blueprint = 'Aa0';
  }

  let generated = '';
  const specifiers = {
    'A': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'a': 'abcdefghijklmnopqrstuvwxyz',
    '0': '0123456789'
  };

  if (length != blueprint.length) {
    const characters = blueprint.split('').map(b => {
      if (specifiers[b]) return specifiers[b];
      return b;
    }).join('');

    for (let i = 0; i < length; i++) {
      generated += characters.charAt(Math.floor(Math.random() * characters.length));
    }
  } else {
    blueprint.split('').forEach(c => {
      if(!specifiers[c]){
        generated += c;
      } else {
        generated += specifiers[c].charAt(Math.floor(Math.random() * specifiers[c].length));
      }
    });
  }
  return generated;
}

export default function UUID() {
  const { crypto } = window || (() => {
    if (typeof require === 'function') {
      try {
        const crypto = require('crypto');
        return { crypto };
      } catch(e) {}
    }
    return {};
  });

  if (crypto) {
    if (typeof crypto.randomUUID === 'function') {
      try {
        return crypto.randomUUID();
      } catch(e) {}
    }

    if (typeof crypto.getRandomValues === 'function') {
      try {
        let generated = '';
        let array = new Uint32Array(8);
        crypto.getRandomValues(array);
        for (let i = 0; i < array.length; i++) {
          generated += (i < 2 || i > 5 ? '' : '-') + array[i].toString(16).slice(-4);
        }
        return generated;

      } catch(e) {}
    }
  }

  return timestampUUID();
}