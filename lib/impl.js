/*
 * impl.js
 *
 * Copyright (c) 2015 Maximilian Antoni <mail@maxantoni.de>
 *
 * @license MIT
 */
'use strict';

var id = "IMPL_STORE_v1";

function attachStore(obj, store) {
  var valueOf = obj.valueOf;
  Object.defineProperty(obj, 'valueOf', {
    value: function (value) {
      return value === id ? store : valueOf.apply(this, arguments);
    },
    writable: true
  });
}

function assertObject(obj, thing) {
  if (!obj || (typeof obj !== 'object' && typeof obj !== 'function')) {
    throw new TypeError(thing + ' must be object');
  }
}

function getStore(obj, thing) {
  assertObject(obj, thing);
  var store = obj.valueOf(id);
  if (store && store.id === id) {
    return store;
  }
  store = { id : id };
  attachStore(obj, store);
  return store;
}

function throwAssociated(key, value) {
  throw new Error('This ' + key + ' is already associated with ' + value);
}

function typeStore(type) {
  var ts = getStore(type, 'Type');
  if (ts.hasOwnProperty('instance')) {
    throwAssociated('type', 'an instance');
  }
  if (ts.hasOwnProperty('factory')) {
    throwAssociated('type', 'a factory');
  }
  return ts;
}

function returns(obj) {
  return function () {
    return obj;
  };
}

function parameters(fn) {
  /*jslint regexp: true*/
  return fn.toString().match(/(\([^\)]*\))/)[1];
}


exports.set = function (contract, type) {
  assertObject(type, 'Type');
  var cs = getStore(contract, 'Contract');
  if (!cs.types) {
    cs.types = [];
  } else if (cs.types.indexOf(type) !== -1) {
    throwAssociated('contract', 'this type');
  }
  cs.types.push(type);
};

exports.instance = function (type, instance) {
  typeStore(type).instance = instance;
};

exports.factory = function (type, factory) {
  if (typeof factory !== 'function') {
    throw new TypeError('Factory must be function');
  }
  typeStore(type).factory = factory;
};

exports.get = function (contract) {
  var store = getStore(contract, 'Contract');
  if (store.instance) {
    return store.instance;
  }
  var types = store.types;
  if (!types) {
    throw new Error('No types for contract');
  }
  var matches = types.map(function (type) {
    var s = getStore(type);
    if (s.factory) {
      return s.factory;
    }
    if (s.instance) {
      return returns(s.instance);
    }
  }).filter(Boolean);
  if (matches.length === 0) {
    throw new Error('No instance or factory for contract');
  }
  if (matches.length > 1) {
    throw new Error('More than one possible instance or factory for contract');
  }
  var args = Array.prototype.slice.call(arguments, 1);
  var instance = matches[0].apply(null, args);
  Object.keys(contract).forEach(function (key) {
    if (!instance[key]) {
      throw new Error('Instance does not implement ' + key
        + parameters(contract[key]));
    }
    if (instance[key].length !== contract[key].length) {
      throw new Error('Instance implements ' + key + parameters(instance[key])
        + ' but contract defines ' + key + parameters(contract[key]));
    }
  });
  return instance;
};
