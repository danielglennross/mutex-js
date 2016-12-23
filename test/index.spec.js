'use strict';

const fs = require('fs');
const expect = require('chai').expect;

const Mutex = require('../lib/index');
const file = './file.json';

class RaceConditionScenario {
  constructor() {
    this.mutex = new Mutex();
  }

  readFile() {
    return new Promise((resolve, reject) =>
      fs.readFile(file, 'utf8', (err, text) =>
        (err ? reject(err) : resolve(JSON.parse(text)))
      )
    );
  }

  readAndWriteWithoutLock(val) {
    return this._doWork(val);
  }

  readAndWriteWithLock(val) {
    return this.mutex.lock(() => this._doWork(val));
  }

  _writeFile(list) {
    return new Promise((resolve, reject) =>
      fs.writeFile(file, JSON.stringify(list), (err) =>
        (err ? reject(err) : resolve())
      )
    );
  }

  _doWork(val) {
    return this.readFile()
    .then(list => {
      list.push(val);
      return this._writeFile(list);
    });
  }
}

describe('race condition', () => {

  beforeEach(done => {
    fs.writeFile(file, '[]', () => done());
  });

  afterEach(done => {
    fs.unlink(file, () => done());
  });

  describe('without locking', () => {

    it(`should return fully populated array when race 
        un-safe methods are called sequentially`, done => {
      const race = new RaceConditionScenario();

      race.readAndWriteWithoutLock(0)
      .then(() => race.readAndWriteWithoutLock(1))
      .then(() => race.readAndWriteWithoutLock(2))
      .then(() => race.readAndWriteWithoutLock(3))
      .then(() => race.readFile())
      .then(list => {
        expect(list).to.exist;
        expect(list).to.have.lengthOf(4);
        expect(list.includes(0)).to.be.true;
        expect(list.includes(1)).to.be.true;
        expect(list.includes(2)).to.be.true;
        expect(list.includes(3)).to.be.true;
        done();
      });
    });

    it(`should return populated array with only last item when race 
        un-safe methods are called in parallel`, done => {
      const race = new RaceConditionScenario();

      Promise.all([
        race.readAndWriteWithoutLock(0),
        race.readAndWriteWithoutLock(1),
        race.readAndWriteWithoutLock(2),
        race.readAndWriteWithoutLock(3)
      ])
      .then(() => race.readFile())
      .then(list => {
        expect(list).to.exist;
        expect(list).to.have.lengthOf(1);
        done();
      });
    });

  });

  describe('with locking', () => {

    it(`should return fully populated array when race 
        un-safe methods are called sequentially`, done => {
      const race = new RaceConditionScenario();

      race.readAndWriteWithLock(0)
      .then(() => race.readAndWriteWithLock(1))
      .then(() => race.readAndWriteWithLock(2))
      .then(() => race.readAndWriteWithLock(3))
      .then(() => race.readFile())
      .then(list => {
        expect(list).to.exist;
        expect(list).to.have.lengthOf(4);
        expect(list.includes(0)).to.be.true;
        expect(list.includes(1)).to.be.true;
        expect(list.includes(2)).to.be.true;
        expect(list.includes(3)).to.be.true;
        done();
      });
    });

    it(`should return fully populated array when race 
        un-safe methods are called in parralel`, done => {
      const race = new RaceConditionScenario();

      Promise.all([
        race.readAndWriteWithLock(0),
        race.readAndWriteWithLock(1),
        race.readAndWriteWithLock(2),
        race.readAndWriteWithLock(3)
      ])
      .then(() => race.readFile())
      .then(list => {
        expect(list).to.exist;
        expect(list).to.have.lengthOf(4);
        expect(list.includes(0)).to.be.true;
        expect(list.includes(1)).to.be.true;
        expect(list.includes(2)).to.be.true;
        expect(list.includes(3)).to.be.true;
        done();
      });
    });

    it('should return a rejected promise if the locked fn throws', done => {
      const race = new RaceConditionScenario();
      race._doWork = () => { throw Error('oops'); };

      Promise.all([
        race.readAndWriteWithLock(0),
        race.readAndWriteWithLock(1),
        race.readAndWriteWithLock(2),
        race.readAndWriteWithLock(3)
      ])
      .then(() => race.readFile())
      .catch(err => {
        expect(err).to.exist;
        expect(err.message).to.equal('oops');
        done();
      });
    });

  });

});
