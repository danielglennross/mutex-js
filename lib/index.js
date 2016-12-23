'use strict';

class Mutex {
  constructor() {
    this._callCount = 0;
    this._deferredPromises = [];
  }

  lock(fn) {
    const aquire = () => {
      const wait = this._callCount === 0
        ? Promise.resolve()
        : new Promise((resolve) => this._deferredPromises.push(resolve));
      ++this._callCount;
      return wait;
    };

    const release = () => {
      const pendingResolve = this._deferredPromises.shift();
      if (pendingResolve) {
        pendingResolve();
      }
      --this._callCount;
    };

    return aquire()
    .then(fn)
    .then(res => {
      release();
      return res;
    })
    .catch(err => {
      release();
      return Promise.reject(err);
    });
  }
}

module.exports = Mutex;
