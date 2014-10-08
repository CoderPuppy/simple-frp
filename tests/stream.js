const test = require('./')

const frp = require('../')

test('frp.stream', function(t) {
	t.sub('should emit events to handlers', function(t) {
		t.plan(2)
		const stream = frp.stream()

		const testVal = 'fizbuz'
		stream(function(err, v) {
			t.error(err)
			t.equal(v, testVal, 'should emit the correct value')
		})
		stream.emit(testVal)
	})

	t.sub('should be able to unsubscribe handlers', function(t) {
		const stream = frp.stream()
		stream(function() {
			t.fail('the handler was called')
		})()
		stream.emit('fizbuz')

		t.end()
	})

	t.sub('should pass errors to handlers', function(t) {
		t.plan(2)

		const testErr = 'fizbuz'

		const stream = frp.stream()
		stream(function(err, v) {
			t.equal(err, testErr, 'should pass the correct error')
			t.equal(v, undefined, 'shouldn\'t pass a value')
		})
		stream.error(testErr)
	})

	t.end()
})