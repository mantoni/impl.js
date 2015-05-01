# Impl

Fantastic dependency injection for npm modules.

## Features

- Made for npm modules with semantic versioning
- Works in browsers with [Browserify][]
- Light weight and fast
- No dependencies

## How does it work?

There are four entities used by impl: "Contracts" define the API that
"instances" of a specific "type" have to implement. An "instance" may be
created by a "factory" function.

### Contracts

A Contract is a plain Node module that exports an API of empty functions. A
simple contract for a messaging API could look like this:

```js
exports.publish = function (message, callback) {};
```

Any JavaScript object that implements a contract has to expose functions with
the same name and arity as defined in the contract.

### Types

A type is an implementation of a contract. Impl doesn't force you to create
types in a specific way. All you have to do is associate the type with the
contract:

```js
function AMQPMessaging() {}
AMQPMessaging.prototype.publish = function (message, callback) {
  // RPC logic over AMQP, invokes callback with reply
};

impl.set(Messaging, AMQPMessaging);
```

The idea is that you depend on the module that defines `Messaging` with
semantic versioning, e.g. `^1.0.0` stating that you're fine with any patches or
new features being implemented in the `Messaging` contract, but no breaking
changes.

### Instances

An instance can be any JavaScript object. An instance is associated with a type
like this:

```js
impl.instance(AMQPMessaging, new AMQPMessaging());
```

This should be done in the bootstraping logic of an application. Your app now
depends on a version of `AMQPMessaging` which in turn depends on the
`Messaging` contract.

### Factories

If you don't want a single instance of something, use a factory function that
gets invoked every time an instance is requested:

```js
impl.factory(AMQPMessaging, function () {
  return new AMQPMessaging();
});
```

Note: Returned instances don't have to be `instanceof Type`.

### Resolving instances by contract

Now you can retrieve instances just by providing a contract:

```js
var messaging = impl.get(Messaging);
```

This means any module that wants an instance of `Messaging` has to depend on
the messaging contract, again by using semantic versioning, e.g. `^1.0.0`. This
ensures that a contract compatible version is made available by the
application.

## API

- `set(Contract, Type)`: Associates a contract with a type that implements the
  contract.
- `instance(Type, instance)`: Sets an instance for a type.
- `factory(Type, factory)`: Sets an factory function for a type.
- `get(Contract)`: Returns an instance for a contract and verifies that the
  resolved instance matches the contract.

