const Set = require('es6-set')
const now = require('right-now')
const EE  = require('events').EventEmitter

function frp(first) {
	var res = [].reduce.call(arguments, function(acc, stream, i) {
		if(i != 0)
			acc(stream.handle)

		return stream
	})

	if(first.handle) {
		function stream(handler) {
			res(handler)
		}
		stream.handle = first.handle
		return stream
	} else return res
}

frp.stream = function() {
	const handlers = []
	function stream(handler) {
		handlers.push(handler)
		function off() {
			if(~handlers.indexOf(handler))
				stream.splice(handlers.indexOf(handler), 1)
			return stream
		}
		off.stream = stream
		return off
	}
	stream.emit = function(v) {
		handlers.forEach(function(handler) {
			handler(v)
		})
	}
	stream.watch = function(handler) {
		return stream(handler)
	}

	return stream
}

frp.property = function(current) {
	const stream = frp.stream()
	stream(function(v) {
		stream.current = stream.now = v
	})
	stream.emit(current)
	stream.watch = function(handler) {
		handler(stream.now)
		return stream(handler)
	}
	return stream
}

frp.propertyify = function() {
	const res = frp.property()
	res.handle = function(v) {
		res.emit(v)
	}
	return res
}

frp.map = function(f) {
	if(typeof(f) != 'function') throw new TypeError('frp.map requires a function')
	const res = frp.stream()
	res.handle = function(v) {
		res.emit(f(v))
	}
	return res
}

frp.inject = function(f) {
	if(typeof(f) != 'function') throw new TypeError('frp.inject requires a function')
	return frp.map(function(v) {
		f(v)
		return v
	})
}

frp.sampleBy = function(tick) {
	const res = frp.stream()
	var last
	res.handle = function(v) {
		last = v
	}
	const off = tick(function() {
		res.emit(last)
	})
	return res
}

frp.scan = function(acc, reducer) {
	const res = frp.property(acc)
	res.handle = function(v) {
		res.emit(reducer(res.now, v))
	}
	return res
}

frp.debounce = function(timeout) {
	const res = frp.stream()
	var last = 0
	res.handle = function(v) {
		const time = now()
		if(time - last >= timeout) {
			res.emit(v)
		}
		last = time
	}
	return res
}

frp.throttle = function(timeout) {
	const res = frp.stream()
	var last = 0
	res.handle = function(v) {
		const time = now()
		if(time - last >= timeout) {
			res.emit(v)
			last = time
		}
	}
	return res
}

frp.merge = function() {
	const res = frp.stream()
	;[].forEach.call(arguments, function(stream) {
		stream(function(v) {
			res.emit(v)
		})
	})
	return res
}

frp.combine = function() {
	const res = frp.property()

	const values = []
	var ready = false

	;[].forEach.call(arguments, function(stream, i) {
		if(typeof(stream) == 'function' && typeof(stream.watch) == 'function') {
			stream.watch(function(v) {
				values[i] = v
				if(ready)
					res.emit([].concat.call(values))
			})
		} else {
			values[i] = stream
		}
	})

	res.emit([].concat.call(values))
	ready = true

	return res
}

module.exports = frp