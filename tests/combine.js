const test = require('./')

const frp = require('../')

test('frp.combine', function(t) {
	t.sub('should combine all the inputs', function(t) {
		const a = frp.property(1)
		const b = frp.stream()
		const c = 3

		const res = frp.combine(a, b, c)(function(err, arr) {
			t.error(err, 'shouldn\'t return an error')
		}).stream

		b.emit(2)

		t.deepEqual(res.now, [ 1, 2, 3 ], 'should return the combined array')

		t.end()
	})

	t.sub('should pass through errors', function(t) {
		t.plan(4)

		const a = frp.stream()
		const b = frp.stream()

		const res = frp.combine(a, b)
		
		const testErrA = 'errorA'
		const offA = res(function(err, arr) {
			t.equal(err, testErrA, 'should pass the correct error')
			t.equal(arr, undefined, 'should not pass any data')
		})
		a.error(testErrA)
		offA()

		const testErrB = 'errorB'
		const offB = res(function(err, arr) {
			t.equal(err, testErrB, 'should pass the correct error')
			t.equal(arr, undefined, 'should not pass any data')
		})
		a.error(testErrB)
		offB()
	})

	t.end()
})