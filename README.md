# mutex-js
Provides a promise-based mechanism for locking around code which requires synchronization
(i.e. you may want to synchronize functions that span multiple iterations of the event loop).

## Install
`npm install --save mutex-js`

## Getting started
```javascript
const Mutex = requires('mutex-js');

const mutex = new Mutex();
mutex.lock(() => {...});
```

## Example
Below, we call an async function `run` several times with different args (the calls will run in parallel).
The function reads data from a file, appends the input to the data and finally writes the modified data back to the file.
Without synchronization, each call to `run` may overlap the results of the previous one. 
Wrapping the function implementation in a locking mechanism ensures that only one call is executing the critical section at a time.

```javascript
const mutex = new Mutex();

// reads file, returns a promise with file data
const readFromFile = () => {...}
// appends arg to data, returns a promise with modified data
const appendData = (data, arg) => {...}
// writes data to file, returns a promise
const writeToFile = (data) => {...}

const run = (arg) =>
  mutex.lock(
    readFromFile()
    .then(data => appendData(data, arg))
    .then(writeToFile)
  );

Promise.all([
  run('foo'),
  run('bar')
])
.then(...)
.catch(...)
```
