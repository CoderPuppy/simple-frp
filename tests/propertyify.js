const test = require('./')

const frp = require('../')

test('frp.propertyify', function(t) {
	t.sub('should return a property', function(t) {
		t.plan(1)
		t.ok(
			frp.property.is(frp(
				frp.stream(),
				frp.propertyify()
			)),
			'should return a property'
		)
	})

	t.end()
})