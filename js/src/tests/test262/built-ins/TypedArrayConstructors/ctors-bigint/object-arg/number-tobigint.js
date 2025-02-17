// |reftest| skip -- BigInt is not supported
// Copyright (C) 2018 Valerie Young. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
/*---
esid: sec-typedarray-object
description: >
  Return abrupt on Number
info: |
  22.2.4.4 TypedArray ( object )

  This description applies only if the TypedArray function is called with at
  least one argument and the Type of the first argument is Object and that
  object does not have either a [[TypedArrayName]] or an [[ArrayBufferData]]
  internal slot.

  ...
  8. Repeat, while k < len
    ...
    b. Let kValue be ? Get(arrayLike, Pk).
    c. Perform ? Set(O, Pk, kValue, true).
  ...

  9.4.5.5 [[Set]] ( P, V, Receiver)

  ...
  2. If Type(P) is String and if SameValue(O, Receiver) is true, then
    a. Let numericIndex be ! CanonicalNumericIndexString(P).
    b. If numericIndex is not undefined, then
      i. Return ? IntegerIndexedElementSet(O, numericIndex, V).
  ...

  9.4.5.9 IntegerIndexedElementSet ( O, index, value )

  ...
  5. If arrayTypeName is "BigUint64Array" or "BigInt64Array",
     let numValue be ? ToBigInt(value).
  ...

  ToBigInt ( argument )

  Object, Apply the following steps:
    1. Let prim be ? ToPrimitive(argument, hint Number).
    2. Return the value that prim corresponds to in Table [BigInt Conversions]

  BigInt Conversions
    Argument Type: Number
    Result: Throw a TypeError exception.

includes: [testBigIntTypedArray.js]
features: [BigInt, TypedArray]
---*/

testWithBigIntTypedArrayConstructors(function(TA) {

  assert.throws(TypeError, function() {
    new TA([1]);
  }, "abrupt completion from Number: 1");

  assert.throws(TypeError, function() {
    new TA([Math.pow(2, 63)]);
  }, "abrupt completion from Number: 2**63");

  assert.throws(TypeError, function() {
    new TA([+0]);
  }, "abrupt completion from Number: +0");

  assert.throws(TypeError, function() {
    new TA([-0]);
  }, "abrupt completion from Number: -0");

  assert.throws(TypeError, function() {
    new TA([Infinity]);
  }, "abrupt completion from Number: Infinity");

  assert.throws(TypeError, function() {
    new TA([-Infinity]);
  }, "abrupt completion from Number: -Infinity");

  assert.throws(TypeError, function() {
    new TA([NaN]);
  }, "abrupt completion from Number: NaN");

});

reportCompare(0, 0);
