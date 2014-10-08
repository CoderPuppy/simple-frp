const test = require('./')

const frp = require('../')

test('frp.map', function(t) {
	t.sub('should transform any data passed through', function(t) {
		t.plan(2)

		const input = frp.stream()

		frp(
			input,
			frp.map(function(v) {
				return 'result'
			})
		)(function(err, v) {
			t.error(err, 'shouldn\'t return an error')
			t.equal(v, 'result', 'should return the correct result')
		})

		input.emit('input')
	})

	t.sub('should throw when the mapper isn\'t a function', function(t) {
		t.throws(function() {
			frp.map()
		})
		t.end()
	})

	t.sub('should pass through errors', function(t) {
		t.plan(2)

		const input = frp.stream()

		const res = frp(
			input,
			frp.map(function() {})
		)
		
		const testErr = 'testing-map-error'
		const off = res(function(err, arr) {
			t.equal(err, testErr, 'should pass the correct error')
			t.equal(arr, undefined, 'should not pass any data')
		})
		input.error(testErr)
	})

	t.sub('should pass an error if the mapper throws', function(t) {
		t.plan(2)

		const input = frp.stream()

		const testErr = 'testing-map-error'

		frp(
			input,
			frp.map(function(v) {
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