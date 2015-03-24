'use strict';

const task = require('generator-runner');
const hyperquest = require('hyperquest');
const concat = require('concat-stream');

let url = 'https://iojs.org/dist/index.json';

// Defined the runner.
task(function* () {
  let stream = hyperquest(url);

  // Yield to some async task and set the value.
  let asyncResult = yield function (next) {
    stream.pipe(concat(
        function (body) {
          return next(null, body.toString());
        }
    ))
    .on('error', function (err) {
      return next(err, undefined);
    });
  };

  // Return value from async task.
  return asyncResult;
},

// Callback function to handle the return of the generator.
function (err, ret) {
  if (err) {
    console.log('Error:', err);
  } 
  else {
    console.error('Result: ', ret);
  }
});
