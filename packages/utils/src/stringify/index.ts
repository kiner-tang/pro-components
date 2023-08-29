import { configure } from 'safe-stable-stringify';

const stringify = configure({
  bigint: true,
  circularValue: 'Magic circle!',
  deterministic: false,
  //   maximumDepth: 1,
  //   maximumBreadth: 4,
});

export { configure, stringify };

export default stringify;
