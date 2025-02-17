// |reftest| skip -- BigInt is not supported
// Copyright (C) 2016 the V8 project authors. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-%typedarray%.prototype.map
description: >
  Integer indexed values changed during iteration
info: |
  22.2.3.19 %TypedArray%.prototype.map ( callbackfn [ , thisArg ] )
includes: [testBigIntTypedArray.js]
features: [BigInt, TypedArray]
---*/

testWithBigIntTypedArrayConstructors(function(TA) {
  var sample = new TA([42n, 43n, 44n]);

  sample.map(function(v, i) {
    if (i < sample.length - 1) {
      sample[i+1] = 42n;
    }

    assert.sameValue(
      v, 42n, "method does not cache values before callbackfn calls"
    );

    return 0n;
  });
});

reportCompare(0, 0);
