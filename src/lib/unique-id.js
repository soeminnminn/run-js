
/**
 * Generate UUID.
 * @returns {string} UUID `${string}-${string}-${string}-${string}-${string}`
 */
function cryptoUUID() {
  let array = null;

  if (typeof window !== 'undefined' && window.crypto) {
    if (typeof window.crypto.randomUUID === 'function') {
      return window.crypto.randomUUID();
    }

    if (typeof(window.crypto.getRandomValues) == 'function') {
      array = new Uint32Array(8);
      window.crypto.getRandomValues(array);
    }

  } else if (typeof process === 'object' && typeof require === 'function') {
    const crypto = require('crypto');

    const webcrypto = crypto.webcrypto || {};
    if (typeof webcrypto.randomUUID === 'function') {
      return webcrypto.randomUUID();
    }

    array = new Uint32Array(crypto.randomBytes(32).buffer);
  } 
  
  if (!array) {
    const buffer = (new Uint8Array(32)).map((_) => Math.floor(Math.random() * 0xff));
    array = new Uint32Array(buffer.buffer);
  }

  let generated = '';
  for (let i = 0; i < array.length; i++) {
    generated += (i < 2 || i > 5 ? '' : '-') + array[i].toString(16).slice(-4);
  }
  return generated;
}

/**
 * Generate timestamp based string.
 * @returns {string}
 */
function timestampID() {
  const g = (n, r = '') => {
    for (let i = n; i--;) {
      r += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)];
    }
    return r;
  }
  let p = (Date.now() * 1e3);
  p++;
  const n = p.toString(36);
  let s = '';
  if (typeof process !== 'undefined') {
    s = process.pid.toString(36);
  } else {
    s = Math.floor(Math.random() * 63).toString(36);
  }
  s = s + g(6 - s.length);

  const k = g(4);
  return s + n + k.substring(0, 12 - n.length);
}

/**
 * Generate random string.
 * @param {number} length The length of string. 
 * @param {string} blueprint form of specifiers, 
 * 'A' = Uppercase alphabet, 'a' = Lowercase alphabet, 'd' = Number, 's' = Special characters,
 * 'password' = for generate random password.
 * @returns {string}
 */
function randomID(length, blueprint) {
  blueprint = typeof blueprint !== 'string' ? 'Aad' : blueprint;

  const specifiers = {
    'A': 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    'a': 'abcdefghijklmnopqrstuvwxyz',
    'd': '0123456789',
    's': '!@#$%^&*()+_-=}{[]|:;"/?.><,`~',
  };

  let characters = blueprint;

  if (/^[Aads0n]+$/.test(blueprint)) {
    blueprint = blueprint.replace(/[0n]/gi, 'd');

    characters = blueprint.split('').reduce((t, x) => {
      if (!t.includes(x)) t.push(x);
      return t;
    }, []).map(b => specifiers[b] || '').join('');

  } else if (blueprint === 'password') {
    length = Math.max(length, 8);
    characters = `${specifiers['A']}${specifiers['a']}${specifiers['d']}!%&@#$^*?_~`;
  }

  const checkStrength = function(password) {
    let total = 0;
    if (password.length >= 8) {
      total += 1;
    } else {
      total -= 1;
    }
    if (password.match(/[A-Z]/)) total += 1;
    if (password.match(/[a-z]/)) total += 1;
    if (password.match(/[0-9]/)) total += 1;
    if (password.match(/[!%&@#\$\^\*\?_~]/)) total += 1;
    return Math.round((total / 5) * 100);
  };

  const generate = function() {
    let generated = '';
    if (characters.length > 5) {
      for (let i = 0; i < length; i++) {
        generated += characters.charAt(Math.floor(Math.random() * characters.length));
      }
    }
    if (blueprint === 'password' && checkStrength(generated) < 90) {
      generated = generate();
    }
    return generated;
  };

  return generate();
}

module.exports = cryptoUUID;
module.exports.randomId = randomID;
module.exports.uuid = cryptoUUID;
module.exports.tsid = timestampID;