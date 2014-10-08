const test = require('./')

const frp = require('../')

test('frp.sampleBy', function(t) {
	t.sub('should ignore events if no signal is given', function(t) {
		const input = frp.stream()

		frp(
			input,
			frp.sampleBy(frp.stream())
		)(function(err, v) {
			t.fail('the handler was called')
		})

		input.emit('abc')
		input.emit('abc')
		input.emit('abc')
		input.emit('abc')

		t.end()
	})

	t.sub('should throw when the tick isn\'t a stream', function(t) {
		t.throws(function() {
			frp.sampleBy()
		})
		t.end()
	})

	t.sub('should pass through the last event when a tick is emitted', function(t) {
		t.plan(2)

		const input = frp.stream()
		const tick  = frp.stream()

		const testVal = 'testvalue'

		const res = frp(
			input,
			frp.sampleBy(tick)
		)(function(err, v) {
			t.error(err, 'shouldn\'t pass an error')
			t.equal(v, testVal, 'should pass the last value')
		})

		input.emit(testVal)
		tick.emit('tick')
	})

	t.sub('should pass through errors from the input', function(t) {
		t.plan(2)

		const input = frp.stream()

		const testErr = 'erroring-test'

		frp(
			input,
			frp.sampleBy(frp.stream())
		)(function(err, v) {
			t.equal(err, testErr, 'should pass the correct error')
			t.equal(v, undefined, 'shouldn\'t pass a value')
		})

		input.error(testErr)
	})

	t.sub('should pass through errors from the tick', function(t) {
		t.plan(2)

		const tick = frp.stream()

		const testErr = 'erroring-test'

		frp(
			frp.stream(),
			frp.sampleBy(tick)
		)(function(err, v) {
			t.equal(err, testErr, 'should pass the correct error')
			t.equal(v, undefined, 'shouldn\'t pass a value')
		})

		tick.error(testErr)
	})

	t.end()
})