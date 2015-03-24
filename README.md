ES6 generators seem to be a very good fit for handling asynchronous actions. I've been using a library, [generator-runner](https://www.npmjs.com/package/generator-runner), which uses ES6 generators for running async tasks. To use the library you create a runner that takes two parameters:

1. **A generator function**. Within this function you ```yield``` to a async task. The async task is invoked with a callback to continue the generator (calling next). The callback returns the ```value``` for the yield expression. The runner then takes the value for yield expression and returns it.
2. **A callback to handle the return of the generator**. The return value from the previous step is handled here.

The syntax for the above is:

```js
// Require generator-runner library.
var task = require('generator-runner');

// Define the runner.
task(

	// Generator function.
	function* () {
	
		// Yield to some async task and set the value for async_result.
		let async_result = yield function (next) {
			// perform some async task
			
			// If the result from the async task causes an error.
			return next(error, undefined);
			
			// OR
			// The result from the async task is good.
			return next(null, 'result from async task');
		};
	
		// Return the value from the async task.
		return async_result;
	},

	// Callback to handle the return of the generator.
	function (err, ret) {
	 // Handle error or return value.
	}
);
```

As an example I want to get the contents of a JSON file from a http request and display the results. The generator function will make the http request using [hyperquest](https://www.npmjs.com/package/hyperquest). The result from the http request is a ```readable stream```. I'll pipe the ```readable stream```into [concat-stream](https://www.npmjs.com/package/concat-stream) which fires a callback with all the data from our ```readable stream```. Then I'll call the callback to continue the generator (calling next) with the results from the http request.

Here's the example:

```js
var task = require('generator-runner');
var hyperquest = require('hyperquest');
var concat = require('concat-stream');

// Set URL that we want to get the contents.
let url = 'https://iojs.org/dist/index.json';

// Define our runner.
task(

	function* () {
	
		// use hyperquest to get the contents of the URL.
		let stream = hyperquest(url);
	
		// Yield to async action.
		let body = yield function (next) {
	
			// Pipe the readable stream, from hyperquest, into
			// concat-stream and call the continuation callback
			// with the results from concat-stream.
			stream.pipe(concat(
				function (body) {
					next(null, body);
				}
			))
			
			// Error! Call continuation callback with error.
			.on('error', function (err) {
				next(err, undefined);
			});
		};
	
		return body;
},

// Callback to handle the return of the generator.
function (err, ret) {
	if (err) {
		console.error(err);
	} else {
		console.log(ret);
	}
});
```

To run the example do the following:

```bash
$ npm install
$ npm run prepublish
$ npm start
```

###**Note:**

1. I use [babel](https://www.npmjs.com/package/babel), turns ES6 code into ES5, in the example files.
2. You will need a directory named ```out```. This is where the output from running babel places the ES5 code.
