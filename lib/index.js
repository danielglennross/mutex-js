'use strict';

class Mutex {
  constructor() {
    this.isLocked = false;
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
        this.isLocked = true;
        // force the fn to return a promise
        return Promise.resolve()
        .then(() => fn())
        .then(val => {
          this.isLocked = false;
          return resolve(val);
        })
        .catch(err => {
          this.isLocked = false;
          return reject(err);
        })
      };
      
      const checkLock = () => {
        if (this.isLocked) {
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