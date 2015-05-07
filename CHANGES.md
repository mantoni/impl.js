# Changes

## 1.3.0

- Add options to `get` and allow to mark the dependency as `optional`

Optional dependencies will return `null` instead of throwing an exception if no
associated instance or contract can be found:

```js
// Do not throw if MyThing is not registered with impl:
var instance = impl.get(MyThing, { optional : true });
```

## 1.2.0

- Add `unset(ContractOrType)` to remove existing associations

## 1.1.1

- Fix main in package.json

## 1.1.0

- Allow to resolve instances by type or contract

## 1.0.1

- Badges for travis build, semver and license
- Fix typo

## 1.0.0

- Initial release
