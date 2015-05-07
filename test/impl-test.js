/*
 * impl.js
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
/*global describe, it*/
'use strict';

var assert = require('assert');
var impl = require('../lib/impl');


function func() {
  return function () { return; };
}
func()(); // coverage


describe('set', function () {

  it('throws if contract is null', function () {
    var Type = func();

    assert.throws(function () {
      impl.set(null, Type);
    }, /TypeError: Contract must be object/);
  });

  it('throws if contract is string', function () {
    var Type = func();

    assert.throws(function () {
      impl.set('my-contract', Type);
    }, /TypeError: Contract must be object/);
  });

  it('throws if type is null', function () {
    assert.throws(function () {
      impl.set({}, null);
    }, /TypeError: Type must be object/);
  });

  it('allows object types', function () {
    assert.doesNotThrow(function () {
      impl.set({}, {});
    });
  });

  it('does not throw if contract already has another type', function () {
    var TypeA = func();
    var TypeB = func();
    var Contract = {};
    impl.set(Contract, TypeA);

    assert.doesNotThrow(function () {
      impl.set(Contract, TypeB);
    });
  });

  it('throws if contract already associated with same type', function () {
    var Type = func();
    var Contract = {};
    impl.set(Contract, Type);

    assert.throws(function () {
      impl.set(Contract, Type);
    }, /Error: This contract is already associated with this type/);
  });

  it('does not replace valueOf', function () {
    var Contract = { valueOf : function () { return 1; } };

    impl.set(Contract, {});

    assert.equal(Contract.valueOf(), 1);
  });

});


describe('instance', function () {

  it('throws if type is null', function () {
    assert.throws(function () {
      impl.instance(null, {});
    }, /TypeError: Type must be object/);
  });

  it('throws if type is string', function () {
    assert.throws(function () {
      impl.instance('some-type', {});
    }, /TypeError: Type must be object/);
  });

  it('does not throw if instance is null', function () {
    var Type = func();

    assert.doesNotThrow(function () {
      impl.instance(Type, null);
    });
  });

  it('throws if type already has an instance', function () {
    var Type = func();
    impl.instance(Type, {});

    assert.throws(function () {
      impl.instance(Type, {});
    }, /Error: This type is already associated with an instance/);
  });

  it('throws if type already has a factory', function () {
    var Type = func();
    impl.factory(Type, func());

    assert.throws(function () {
      impl.instance(Type, {});
    }, /Error: This type is already associated with a factory/);
  });

});


describe('factory', function () {

  it('throws if type is null', function () {
    assert.throws(function () {
      impl.factory(null, func());
    }, /TypeError: Type must be object/);
  });

  it('throws if factory is object', function () {
    var Type = func();

    assert.throws(function () {
      impl.factory(Type, {});
    }, /TypeError: Factory must be function/);
  });

  it('throws if type already has a factory', function () {
    var Type = func();
    impl.factory(Type, func());

    assert.throws(function () {
      impl.factory(Type, func());
    }, /Error: This type is already associated with a factory/);
  });

  it('throws if type already has an instance', function () {
    var Type = func();
    impl.instance(Type, {});

    assert.throws(function () {
      impl.factory(Type, func());
    }, /Error: This type is already associated with an instance/);
  });

});


describe('get', function () {

  it('throws if contract is null', function () {
    assert.throws(function () {
      impl.get(null);
    }, /TypeError: Contract must be object/);
  });

  it('throws if contract is string', function () {
    assert.throws(function () {
      impl.get('some-contract');
    }, /TypeError: Contract must be object/);
  });

  it('returns instance for contract (set, instance)', function () {
    var Type = func();
    var Contract = {};
    var instance = func();
    impl.set(Contract, Type);
    impl.instance(Type, instance);

    var value = impl.get(Contract);

    assert.strictEqual(value, instance);
  });

  it('returns instance for contract (instance, set)', function () {
    var Type = func();
    var Contract = {};
    var instance = func();
    impl.instance(Type, instance);
    impl.set(Contract, Type);

    var value = impl.get(Contract);

    assert.strictEqual(value, instance);
  });

  it('returns factory result for contract', function () {
    var Type = func();
    var Contract = {};
    var instance = {};
    impl.set(Contract, Type);
    impl.factory(Type, function () {
      return instance;
    });

    var value = impl.get(Contract);

    assert.strictEqual(value, instance);
  });

  it('passes additional arguments to factory', function () {
    var Type = func();
    var Contract = {};
    impl.set(Contract, Type);
    impl.factory(Type, function (a, b, c) {
      return a * b * c;
    });

    var value = impl.get(Contract, 2, 3, 7);

    assert.equal(value, 42);
  });

  it('throws if there is more than one possible instance', function () {
    var Contract = {};
    var TypeA = func();
    var TypeB = func();
    impl.set(Contract, TypeA);
    impl.set(Contract, TypeB);
    impl.instance(TypeA, {});
    impl.instance(TypeB, {});

    assert.throws(function () {
      impl.get(Contract);
    }, /Error: More than one possible instance or factory for contract/);
  });

  it('throws if there is more than one possible factory', function () {
    var Contract = {};
    var TypeA = func();
    var TypeB = func();
    impl.set(Contract, TypeA);
    impl.set(Contract, TypeB);
    impl.factory(TypeA, func());
    impl.factory(TypeB, func());

    assert.throws(function () {
      impl.get(Contract);
    }, /Error: More than one possible instance or factory for contract/);
  });

  it('throws if there is more than one possible combination', function () {
    var Contract = {};
    var TypeA = func();
    var TypeB = func();
    impl.set(Contract, TypeA);
    impl.set(Contract, TypeB);
    impl.instance(TypeA, {});
    impl.factory(TypeB, func());

    assert.throws(function () {
      impl.get(Contract);
    }, /Error: More than one possible instance or factory for contract/);
  });

  it('throws if there are no types for contract', function () {
    assert.throws(function () {
      impl.get({});
    }, /Error: No types for contract/);
  });

  it('throws if there are no instances for contract', function () {
    var Contract = {};
    var Type = func();
    impl.set(Contract, Type);

    assert.throws(function () {
      impl.get(Contract);
    }, /Error: No instance or factory for contract/);
  });

  it('throws if contract has function and implementation not', function () {
    var foo = function (bar, baz) { /*jslint unparam: true*/return; };
    foo(); // coverage
    var Contract = {
      foo: foo
    };
    var Type = func();
    impl.set(Contract, Type);
    impl.instance(Type, {});

    assert.throws(function () {
      impl.get(Contract);
    }, /Error: Instance does not implement foo\(bar, baz\)/);
  });

  it('throws if contract function has different arity', function () {
    var foo = function (bar, baz, cb) { /*jslint unparam: true*/return; };
    var bar = function (bar, baz) { /*jslint unparam: true*/return; };
    foo(); // coverage
    bar(); // coverage
    var Contract = {
      foo: foo
    };
    var Type = func();
    impl.set(Contract, Type);
    impl.instance(Type, {
      foo: bar
    });

    assert.throws(function () {
      impl.get(Contract);
    }, new RegExp('Error: Instance implements foo\\(bar, baz\\) but contract '
      + 'defines foo\\(bar, baz, cb\\)'));
  });

  it('does not throw if instance matches contract', function () {
    var foo = function (bar, baz, cb) { /*jslint unparam: true*/return; };
    var bar = function (bar, baz, cb) { /*jslint unparam: true*/return; };
    foo(); // coverage
    bar(); // coverage
    var Contract = {
      foo: foo
    };
    var Type = func();
    impl.set(Contract, Type);
    impl.instance(Type, {
      foo: bar
    });

    assert.doesNotThrow(function () {
      impl.get(Contract);
    });
  });

  it("returns an instance for a type without a contract", function () {
    var instance = {};
    var Type = func();
    impl.instance(Type, instance);

    assert.strictEqual(impl.get(Type), instance);
  });

  it("does not throw if 'optional' and contract is unknown", function () {
    var value = impl.get({}, { optional : true });

    assert.strictEqual(value, null);
  });

  it("does not throw if 'optional' and contract has no instance", function () {
    var Contract = {};
    impl.set(Contract, func());

    var value = impl.get(Contract, { optional : true });

    assert.strictEqual(value, null);
  });

});


describe("unset", function () {

  it("removes instance", function () {
    var Type = func();
    impl.instance(Type, {});

    impl.unset(Type);

    assert.throws(function () {
      impl.get(Type);
    }, Error);
  });

  it("throws if null is given", function () {
    assert.throws(function () {
      impl.unset(null);
    }, /TypeError: Argument must be object/);
  });

  it("throws if string is given", function () {
    assert.throws(function () {
      impl.unset("some-foo");
    }, /TypeError: Argument must be object/);
  });

  it("throws if given object does not have a store", function () {
    assert.throws(function () {
      impl.unset({});
    }, /Error: Given object was not associated/);
  });

});
