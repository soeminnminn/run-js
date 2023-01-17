const Arithmetic = {
  infinity: 0,
  minusInfinity: 1,
  minusZero: 2,
};

function isMinusZero(value) {
  return 1 / value === -Infinity;
}

export default {
  type: 'Arithmetic',
  lookup: Number,
  shouldTransform(type, value) {
    return (
      type === 'number' &&
      (value === Infinity || value === -Infinity || isMinusZero(value))
    );
  },
  toSerializable(value) {
    return value === Infinity
      ? Arithmetic.infinity
      : value === -Infinity
      ? Arithmetic.minusInfinity
      : Arithmetic.minusZero;
  },
  fromSerializable(data) {
    if (data === Arithmetic.infinity) return Infinity;
    if (data === Arithmetic.minusInfinity) return -Infinity;
    if (data === Arithmetic.minusZero) return -0;

    return data;
  },
}
