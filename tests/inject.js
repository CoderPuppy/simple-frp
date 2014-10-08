const test = require('./')

const frp = require('../')

test('frp.inject', function(t) {
	t.sub('should call the injection with the value', function(t) {
		t.plan(3)

		const input = frp.stream()

		const testValue = 'fizbuz-test'

		frp(
			input,
			frp.inject(function(v) {
				t.equal(v, testValue, 'should pass the correct value')
			})
		)(function(err, v) {
			t.error(err, 'shouldn\'t pass an error')
			t.equal(v, testValue, 'should pass the correct result')
		})

		input.emit(testValue)
	})

	t.sub('should throw when the injection isn\'t a function', function(t) {
		t.throws(function() {
			frp.inject()
		})
		t.end()
	})

	t.sub('should pass through errors', function(t) {
		t.plan(2)

		const input = frp.stream()

		const res = frp(
			input,
			frp.inject(function() {})
		)
		
		const testErr = 'testing-inject-error'
		const off = res(function(err, arr) {
			t.equal(err, testErr, 'should pass the correct error')
			t.equal(arr, undefined, 'should not pass any data')
		})
		input.error(testErr)
	})

	t.sub('should pass an error if the mapper throws', function(t) {
		t.plan(2)

		const input = frp.stream()

		const testErr = 'testing-inject-error'

		frp(
			input,
			frp.inject(function(v) {
				throw testErr
			})
		)(function(err, v) {
			t.equal(err, testErr, 'should pass the correct error')
			t.equal(v, undefined, 'shouldn\'t pass any value')
		})

		input.emit('fizbuz')
	})

	t.end()
})