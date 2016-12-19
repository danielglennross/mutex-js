'use strict';

class Mutex {
  constructor() {
    this._callCount = 0;
    this._deferredPromises = [];
  }

  lock(fn) {
    const aquire = () => {
      const p = this._callCount == 0
        ? Promise.resolve()
        : new Promise((resolve) => this._deferredPromises.push(resolve));
      
      ++this._callCount;
      return p;
    }

    const release = (val) => {
      const pendingResolve = this._deferredPromises.shift();
      if (pendingResolve) {
        pendingResolve();
      }
      --this._callCount;
      return val;
    }

    return aquire()
    .then(() => fn())
    .then(
      res => release(res), 
      err => release(Promise.reject(err))
    );
  }
}

module.exports = Mutex;
