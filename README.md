# mutex-js
provides a mechanism for locking around code requiring synchronization when dealing with parallel calls
(e.g. by calling `Promise.all()`)

## example
```javascript
// example class using locking mechanism to synchronize parallel async calls
const Mutex = requires('mutex-js');
class Synchronize {
  constructor() {
    this._mutex = new Mutex();
  }

  run(args) {
    return this._mutex.lock(() => this._doCritialWork(args));
  }

  _doCritialWork(args) {
    ...
  }
}

...

// example caller triggering parallel async calls
const synchronize = new Synchronize();
Promise.all([
  synchronize.run(args1),
  synchronize.run(args2),
  synchronize.run(args3),
  synchronize.run(args4)
])
.then(...)
```
