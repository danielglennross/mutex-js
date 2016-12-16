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

  writeFile(list) {
    return new Promise((resolve, reject) =>
      fs.writeFile(file, JSON.stringify(list), (err) =>
        (err ? reject(err) : resolve())
      )
    );
  }

  doWork(val) {
    return this.readFile()
    .then(list => {
      list.push(val);
      return this.writeFile(list);
    });
  }

  readAndWriteWithoutLock(val) {
    return this.doWork(val);
  }

  readAndWriteWithLock(val) {
    return this.mutex.lock(() => this.doWork(val));
  }
}

describe('mutex - race condition without mutex', () => {

  beforeEach(done => {
    fs.writeFile(file, '[]', () => done());
  });

  afterEach(done => {
    fs.unlink(file, () => done());
  });

  const findIn = (list, val) => list.filter(x => x === val)[0];

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
      expect(findIn(list, 0)).to.exist;
      expect(findIn(list, 1)).to.exist;
      expect(findIn(list, 2)).to.exist;
      expect(findIn(list, 3)).to.exist;
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

  it(`should return fully populated array when race 
      un-safe methods are called sequentially with locking`, done => {
    const race = new RaceConditionScenario();

    race.readAndWriteWithLock(0)
    .then(() => race.readAndWriteWithLock(1))
    .then(() => race.readAndWriteWithLock(2))
    .then(() => race.readAndWriteWithLock(3))
    .then(() => race.readFile())
    .then(list => {
      expect(list).to.exist;
      expect(list).to.have.lengthOf(4);
      expect(findIn(list, 0)).to.exist;
      expect(findIn(list, 1)).to.exist;
      expect(findIn(list, 2)).to.exist;
      expect(findIn(list, 3)).to.exist;
      done();
    });
  });

  it(`should return fully populated array when race 
      un-safe methods are called in parralel with locking`, done => {
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
      expect(findIn(list, 0)).to.exist;
      expect(findIn(list, 1)).to.exist;
      expect(findIn(list, 2)).to.exist;
      expect(findIn(list, 3)).to.exist;
      done();
    });
  });

});
