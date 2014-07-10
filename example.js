const frp = require('./')

const a = frp.property(1)
const b = frp.stream()
const c = 3

frp.combine(a, b, c).watch(function(arr) {
	console.log(arr)
})

b.emit(2)