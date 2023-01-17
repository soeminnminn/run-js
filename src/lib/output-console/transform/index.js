import Arithmetic from './arithmetic.js';
import Function from './function.js';
import Html from './html.js';
import Map from './map.js';

import Replicator from './replicator.js';

const transforms = [Html, Function, Arithmetic, Map];

const replicator = new Replicator();
replicator.addTransforms(transforms);

export function Encode(data, limit) {
  return JSON.parse(replicator.encode(data, limit));
}

export function Decode(data) {
  const decoded = replicator.decode(JSON.stringify(data));
  // remove __console_feed_remaining__
  decoded.data.pop();
  return decoded;
}

export function Replicate(data, limit) {
  const encoded = replicator.encode(data, limit);
  const decoded = replicator.decode(encoded);
  // remove __console_feed_remaining__
  decoded.pop();
  return decoded;
}