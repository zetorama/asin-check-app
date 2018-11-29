import { Handler } from './lib/lamda-handler'

const obj = {
	foo: 'bar',
	_requested: 0,
}
export const handler: Handler = (event, context, callback) => {
	console.log('queryStringParameters', event.queryStringParameters)

	obj._requested++
	callback(null, {
		statusCode: 200,
		body: JSON.stringify({ msg: 'Hello, World (from TS)!', ...obj }),
	})
}
