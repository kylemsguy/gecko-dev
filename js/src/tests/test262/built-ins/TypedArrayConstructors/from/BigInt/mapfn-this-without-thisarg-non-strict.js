// |reftest| skip -- BigInt is not supported
// Copyright (C) 2016 the V8 project authors. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
/*---
esid: sec-%typedarray%.from
description: >
  Assert mapfn `this` without thisArg
info: |
  22.2.2.1 %TypedArray%.from ( source [ , mapfn [ , thisArg ] ] )

  ...
  5. If thisArg was supplied, let T be thisArg; else let T be undefined.
  ...
  10. Repeat, while k < len
    ...
    c. If mapping is true, then
      i. Let mappedValue be ? Call(mapfn, T, « kValue, k »).
  ...
includes: [testBigIntTypedArray.js]
flags: [noStrict]
features: [BigInt, TypedArray]
---*/

var global = this;

testWithBigIntTypedArrayConstructors(function(TA) {
  var results = [];
  var mapfn = function(x) {
    results.push(this);
    return x;
  };

  TA.from([42n, 43n], mapfn);

  assert.sameValue(results.length, 2);
  assert.sameValue(results[0], global);
  assert.sameValue(results[1], global);
});

reportCompare(0, 0);
