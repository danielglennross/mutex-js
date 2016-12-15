# mutex-js
provides a mechanism for syncing around resources when dealing with parallel promise calls

## example
```javascript
const Mutex = requires('mutex-js');

class Sync {
  constructor() {
    this._mutex = new Mutex();
  }

  run() {
    return this._mutex.lock(() => this._doSyncWork());
  }

  _doSyncWork() {
    ...
  }
}
```
