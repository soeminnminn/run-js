
/**
 * @param {string} string
 * @param {number} index
 * @return {boolean}
 */
function isDigitAt(string, index) {
  const c = string.charCodeAt(index);
  return 48 <= c && c <= 57;
}

function mixin(dest, src, redefine) {
  if (!dest) {
    throw new TypeError('argument dest is required');
  }
  if (!src) {
    throw new TypeError('argument src is required');
  }

  const hasOwnProperty = Object.prototype.hasOwnProperty;
  if (redefine === false) {
    redefine = true;
  }

  Object.getOwnPropertyNames(src).forEach((name) => {
    if (!redefine && hasOwnProperty.call(dest, name)) {
      return;
    }
    const descriptor = Object.getOwnPropertyDescriptor(src, name);
    Object.defineProperty(dest, name, descriptor);
  })
  return dest;
}

const defaultFormatters = {
  s: (obj) => {
    if (typeof obj !== 'string') return '';
    return String(obj);
  },

  f: (obj) => {
    if (typeof obj !== 'number') return 'NaN';
    return obj;
  },

  // Firebug allows both %i and %d for formatting integers.
  i: (obj) => {
    if (typeof obj !== 'number') return 'NaN';
    return Math.floor(obj);
  },

  d: (obj) => {
    if (typeof obj !== 'number') return 'NaN';
    return Math.floor(obj);
  },

  // Firebug uses %c for styling the message.
  c: (obj, token) => {
    const next = token.next(true);
    if (next) return `<span style='${obj}'>${next.value}</span>`;
    return '';
  },
};

/**
 * @param {string} format
 * @param {!Object.<string, function(string, ...):*>} formatters
 * @return {!Array.<!Object>}
 */
function tokenizeFormatString(format, formatters) {
  const tokens = [];
  let substitutionIndex = 0;

  function addStringToken(str) {
    if (tokens.length && tokens[tokens.length - 1].type === 'string')
      tokens[tokens.length - 1].value += str;
    else tokens.push({ type: 'string', value: str });
  }

  function addSpecifierToken(specifier, precision, substitutionIndex) {
    tokens.push({
      type: 'specifier',
      specifier: specifier,
      precision: precision,
      substitutionIndex: substitutionIndex
    });
  }

  let index = 0;
  for (
    let precentIndex = format.indexOf('%', index);
    precentIndex !== -1;
    precentIndex = format.indexOf('%', index)
  ) {
    if (format.length === index) {
      // unescaped % sign at the end of the format string.
      break;
    }
    addStringToken(format.substring(index, precentIndex));
    index = precentIndex + 1;

    if (format[index] === '%') {
      // %% escape sequence.
      addStringToken('%');
      ++index;
      continue;
    }

    if (isDigitAt(format, index)) {
      // The first character is a number, it might be a substitution index.
      const number = parseInt(format.substring(index), 10);
      while (isDigitAt(format, index)) ++index;

      // If the number is greater than zero and ends with a "$",
      // then this is a substitution index.
      if (number > 0 && format[index] === '$') {
        substitutionIndex = number - 1;
        ++index;
      }
    }

    let precision = -1;
    if (format[index] === '.') {
      // This is a precision specifier. If no digit follows the ".",
      // then the precision should be zero.
      ++index;
      precision = parseInt(format.substring(index), 10);
      if (isNaN(precision)) precision = 0;

      while (isDigitAt(format, index)) ++index;
    }

    if (!(format[index] in formatters)) {
      addStringToken(format.substring(precentIndex, index + 1));
      ++index;
      continue;
    }

    addSpecifierToken(format[index], precision, substitutionIndex);

    ++substitutionIndex;
    ++index;
  }

  addStringToken(format.substring(index));

  return tokens;
}

/**
 * @param {string} format
 * @param {?ArrayLike} substitutions
 * @param {!Object.<string, function(string, ...):Q>} formatters
 * @param {!T} initialValue
 * @param {function(T, Q): T|undefined} append
 * @param {!Array.<!Object>=} tokenizedFormat
 * @return {!{formattedResult: T, unusedSubstitutions: ?ArrayLike}};
 * @template T, Q
 */
export function format(format, substitutions, formatters, initialValue, append, tokenizedFormat) {
  if (!initialValue && typeof append !== 'function') {
    initialValue = '';
    append = (prev, str) => prev + str;
  }

  if (!format || !substitutions || !substitutions.length) {
    return {
      formattedResult: append(initialValue, format),
      unusedSubstitutions: substitutions
    };
  }

  formatters = mixin(defaultFormatters, formatters || {}, true);

  function prettyFunctionName() {
    return `String.format("${format}", "${Array.prototype.join.call(substitutions, '", "')}")`;
  }

  function warn(msg) {
    console.warn(`${prettyFunctionName()}: ${msg}`);
  }

  function error(msg) {
    console.error(`${prettyFunctionName()}: ${msg}`);
  }

  let result = initialValue;
  const tokens = tokenizedFormat || tokenizeFormatString(format, formatters);
  const usedSubstitutionIndexes = {};

  for (let i = 0; i < tokens.length; ++i) {
    const token = tokens[i];

    let skipNext = false;
    token.next = (skipped) => {
      const n = i + 1;
      if (tokens.length > n) {
        skipNext = !!skipped;
        return tokens[n];
      }
      return null;
    };

    if (token.type === 'string') {
      result = append(result, token.value);
      if (skipNext) i++;
      continue;
    }

    if (token.type !== 'specifier') {
      error(`Unknown token type "${token.type}" found.`);
      continue;
    }

    if (token.substitutionIndex >= substitutions.length) {
      // If there are not enough substitutions for the current substitutionIndex
      // just output the format specifier literally and move on.
      error(
        `not enough substitution arguments. Had ${substitutions.length} but needed ${token.substitutionIndex + 1}, so substitution was skipped.`
      );
      result = append(
        result,
        `%${(token.precision > -1 ? token.precision : '') + token.specifier}`
      );

      if (skipNext) i++;
      continue;
    }

    usedSubstitutionIndexes[token.substitutionIndex] = true;

    if (!(token.specifier in formatters)) {
      // Encountered an unsupported format character, treat as a string.
      warn(
        `unsupported format character \u201C${token.specifier}\u201D. Treating as a string.`
      );
      result = append(result, substitutions[token.substitutionIndex]);

      if (skipNext) i++;
      continue;
    }

    result = append(
      result,
      formatters[token.specifier](
        substitutions[token.substitutionIndex],
        token
      )
    );

    if (skipNext) i++;
  }

  const unusedSubstitutions = [];
  for (let i = 0; i < substitutions.length; ++i) {
    if (i in usedSubstitutionIndexes) continue;
    unusedSubstitutions.push(substitutions[i]);
  }

  return { formattedResult: result, unusedSubstitutions: unusedSubstitutions };
}