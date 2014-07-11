const frp = require('./')

const a = frp.property(1)
const b = frp.stream()
const c = 3

frp.combine(a, b, c).watch(function(err, arr) {
	if(err)
		throw err
	else
		console.log(arr)
})

b.emit(2)