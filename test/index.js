import assert from 'node:assert';
import stringify from '../src/XTerm/ConsoleAddon/stringify';

describe('stringify', function () {
  describe('#parse()', function () {
    it('should return -1 when the value is not present', function () {
      const str = stringify.parse(['hello', 'world', '!']);
      console.log(str);
      assert.equal('', 'Hello world!');
    });
  });
});
