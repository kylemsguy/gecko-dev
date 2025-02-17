// |reftest| skip -- BigInt is not supported
// Copyright (C) 2016 the V8 project authors. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
/*---
esid: sec-typedarray-typedarray
description: >
  Return abrupt from buffer.constructor.@@species.prototype
info: |
  22.2.4.3 TypedArray ( typedArray )

  This description applies only if the TypedArray function is called with at
  least one argument and the Type of the first argument is Object and that
  object has a [[TypedArrayName]] internal slot.

  ...
  18. Else,
    a. Let bufferConstructor be ? SpeciesConstructor(srcData, %ArrayBuffer%).
  ...

  7.3.20 SpeciesConstructor ( O, defaultConstructor )

  ...
  5. Let S be ? Get(C, @@species).
  6. If S is either undefined or null, return defaultConstructor.
  7. If IsConstructor(S) is true, return S.
  8. Throw a TypeError exception.
includes: [testBigIntTypedArray.js]
features: [BigInt, Symbol.species, TypedArray]
---*/

var sample1 = new BigInt64Array();
var sample2 = new BigUint64Array();

var ctor = function() {
  throw new Test262Error();
};
var m = { m() {} }.m;
ctor[Symbol.species] = m;

testWithBigIntTypedArrayConstructors(function(TA) {
  var sample = TA === BigInt64Array ? sample2 : sample1;

  sample.buffer.constructor = ctor;

  assert.throws(TypeError, function() {
    new TA(sample);
  });
});

reportCompare(0, 0);
