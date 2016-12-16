'use strict';

class Mutex {
  constructor() {
    this._isLocked = false;
  }

  /**
   * Locks over a function that requires synchronization
   *
   * @param  {function} fn - the function to sync over
   * @return {promise} returns the result of fn
   */
  lock(fn) {
    return new Promise((resolve, reject) => {
      const unLocked = () => {
        this._isLocked = true;
        // force the fn to return a promise
        return Promise.resolve()
        .then(() => fn())
        .then(val => {
          this._isLocked = false;
          return resolve(val);
        })
        .catch(err => {
          this._isLocked = false;
          return reject(err);
        })
      };
      
      const checkLock = () => {
        if (this._isLocked) {
          setTimeout(() => checkLock(), 0);
        } else {
          unLocked();
        }
      };
      checkLock();
    });
  }
}

module.exports = Mutex;