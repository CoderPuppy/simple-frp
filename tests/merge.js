const test = require('./')

const frp = require('../')

test('frp.merge', function(t) {
	t.sub('should merge all the input streams into one', function(t) {
		const inputs = [
			frp.stream(),
			frp.stream(),
			frp.stream(),
			frp.stream(),
			frp.stream(),
			frp.stream()
		]

		const res = frp(
			frp.merge.apply(frp, inputs),
			frp.scan([], function(acc, v) {
				return acc.concat([ v ])
			})
		)

		inputs.forEach(function(stream, i) {
			stream.emit(i)
		})

		t.deepEqual(res.now, inputs.map(function(stream, i) {
			return i
		}), 'should pass through all the events in order')

		t.end()
	})

	t.sub('should pass through any errors', function(t) {
		const streams = [
			frp.stream(),
			frp.stream(),
			frp.stream(),
			frp.stream(),
			frp.stream()
		]

		t.plan(streams.length * 2)

		const res = frp.merge.apply(frp, streams)
		
		streams.forEach(function(stream, i) {
			const testErr = 'error-' + i
			const off = res(function(err, arr) {
				t.equal(err, testErr, 'should pass the correct error')
				t.equal(arr, undefined, 'should not pass any data')
			})
			stream.error(testErr)
			off()
		})
	})

	t.end()
})