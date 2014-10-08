const test = require('./')

const frp = require('../')

test('frp.scan', function(t) {
	t.sub('should pass though errors', function(t) {
		t.plan(2)

		const input = frp.stream()

		const testErr = 'erroring-test'

		frp(
			input,
			frp.scan(null, function() {})
		)(function(err, v) {
			t.equal(err, testErr, 'should pass the correct error')
			t.equal(v, undefined, 'shouldn\'t pass a value')
		})

		input.error(testErr)
	})

	t.end()
})