// |reftest| skip -- BigInt is not supported
// Copyright (C) 2016 the V8 project authors. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/*---
esid: sec-%typedarray%.prototype.includes
description: get the integer value from fromIndex
info: |
  22.2.3.13 %TypedArray%.prototype.includes ( searchElement [ , fromIndex ] )

  %TypedArray%.prototype.includes is a distinct function that implements the
  same algorithm as Array.prototype.includes as defined in 22.1.3.11 except that
  the this object's [[ArrayLength]] internal slot is accessed in place of
  performing a [[Get]] of "length".

  22.1.3.11 Array.prototype.includes ( searchElement [ , fromIndex ] )

  ...
  4. Let n be ? ToInteger(fromIndex). (If fromIndex is undefined, this step
  produces the value 0.)
  5. If n ≥ 0, then
    a. Let k be n.
  ...
  7. Repeat, while k < len
    a. Let elementK be the result of ? Get(O, ! ToString(k)).
    b. If SameValueZero(searchElement, elementK) is true, return true.
    c. Increase k by 1.
  8. Return false.
includes: [testBigIntTypedArray.js]
features: [BigInt, TypedArray]
---*/

var obj = {
  valueOf: function() {
    return 1;
  }
};

testWithBigIntTypedArrayConstructors(function(TA) {
  var sample;

  sample = new TA([42n, 43n]);
  assert.sameValue(sample.includes(42n, "1"), false, "string [0]");
  assert.sameValue(sample.includes(43n, "1"), true, "string [1]");

  assert.sameValue(sample.includes(42n, true), false, "true [0]");
  assert.sameValue(sample.includes(43n, true), true, "true [1]");

  assert.sameValue(sample.includes(42n, false), true, "false [0]");
  assert.sameValue(sample.includes(43n, false), true, "false [1]");

  assert.sameValue(sample.includes(42n, NaN), true, "NaN [0]");
  assert.sameValue(sample.includes(43n, NaN), true, "NaN [1]");

  assert.sameValue(sample.includes(42n, null), true, "null [0]");
  assert.sameValue(sample.includes(43n, null), true, "null [1]");

  assert.sameValue(sample.includes(42n, undefined), true, "undefined [0]");
  assert.sameValue(sample.includes(43n, undefined), true, "undefined [1]");

  assert.sameValue(sample.includes(42n, null), true, "null [0]");
  assert.sameValue(sample.includes(43n, null), true, "null [1]");

  assert.sameValue(sample.includes(42n, obj), false, "object [0]");
  assert.sameValue(sample.includes(43n, obj), true, "object [1]");
});

reportCompare(0, 0);
