// Copyright (C) 2015 the V8 project authors. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
/*---
es6id: 9.5.9
description: >
    [[Set]] ( P, V, Receiver)

    Returns true if trap returns true and target property is not configurable
    but writable.
features: [Reflect]
---*/

var target = {};
var handler = {
  set: function(t, prop, value, receiver) {
    return true;
  }
};
var p = new Proxy(target, handler);

Object.defineProperty(target, 'attr', {
  configurable: false,
  writable: true,
  value: 'foo'
});

assert(Reflect.set(p, "attr", 1));

reportCompare(0, 0);
