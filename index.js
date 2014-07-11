const Set = require('es6-set')
const now = require('right-now')
const EE  = require('events').EventEmitter

function frp(first) {
	const streams = [].slice.call(arguments, 1)

	if(frp.stream.is(first))
		return start(first)
	else
		return function(input) {
			return start(first(input))
		}

	function start(first) {
		return streams.reduce(function(acc, stream) {
			return stream(acc)
		}, first)
	}
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
	stream.stream = stream
	stream.watch  = stream

	stream.emit = function(v) {
		handlers.forEach(function(handler) {
			handler(null, v)
		})
		return stream
	}
	stream.error = function(err) {
		handlers.forEach(function(handler) {
			handler(err)
		})
		if(handlers.length == 0)
			throw err
		return stream
	}

	return stream
}
frp.stream.is = function(stream) {
	return typeof(stream) == 'function' && typeof(stream.watch) == 'function'
}

frp.property = function(current) {
	const stream = frp.stream()
	stream(function(err, v) {
		if(!err)
			stream.current = stream.now = v
	})
	stream.emit(current)
	stream.watch = function(handler) {
		handler(null, stream.now)
		return stream(handler)
	}
	stream.watch.stream = stream
	return stream
}

frp.propertyify = function() {
	return function(input) {
		const out = frp.property()
		input.watch(function(err, v) {
			if(err)
				out.error(err)
			else
				out.emit(v)
		})
		return out
	}
}

frp.map = function(f) {
	if(typeof(f) != 'function') throw new TypeError('frp.map requires a function')
	return function(input) {
		const out = frp.stream()
		input.watch(function(err, v) {
			if(err) {
				out.error(err)
			} else {
				try {
					out.emit(f(v))
				} catch(e) {
					out.error(e)
				}
			}
		})
		return out
	}
}

frp.inject = function(f) {
	if(typeof(f) != 'function') throw new TypeError('frp.inject requires a function')
	return frp.map(function(v) {
		f(v)
		return v
	})
}

frp.sampleBy = function(tick) {
	if(!frp.stream.is(tick)) throw new TypeError('tick needs to be a stream')
	return function(input) {
		const out = frp.stream()

		var last
		input.watch(function(err, v) {
			if(err)
				out.error(err)
			else
				last = v
		})

		tick(function(err, v) {
			if(err) { // should this emit the error to out or throw it or what?
				console.error(err)
			} else if(last !== undefined) {
				out.emit(last)
				last = undefined
			}
		})

		return out
	}
}

frp.scan = function(acc, reducer) {
	return function(input) {
		const out = frp.property(acc)
		input(function(err, v) {
			if(err)
				out.error(err)
			else
				out.emit(reducer(out.now, v))
		})
		return out
	}
}

frp.debounce = function(timeout) {
	return function(input) {
		const out = frp.stream()
		var last = 0
		input.watch(function(err, v) {
			if(err) {
				out.error(err)
			} else {
				const time = now()
				if(time - last >= timeout) {
					out.emit(v)
				}
				last = time
			}
		})
		return out
	}
}

frp.throttle = function(delay) {
	return function(input) {
		const out = frp.stream()
		var id
		var last
		var immediate = false

		function timeout() {
			if(last === undefined) {
				immediate = true
			} else {
				out.emit(last)
				last = undefined
				id = setTimeout(timeout, delay)
			}
		}

		id = setTimeout(timeout, delay)

		input.watch(function(err, v) {
			if(err) {
				out.error(err)
			} else {
				if(immediate) {
					out.emit(v)
					immediate = false
					id = setTimeout(timeout, delay)
				} else {
					last = v
				}
			}
		})
		return out
	}
}

frp.merge = function() {
	const out = frp.stream()
	;[].forEach.call(arguments, function(stream) {
		stream(function(err, v) {
			if(err)
				out.error(err)
			else
				out.emit(v)
		})
	})
	return out
}

frp.combine = function() {
	const out = frp.property([])

	const values = []

	;[].forEach.call(arguments, function(stream, i) {
		if(typeof(stream) == 'function' && typeof(stream.watch) == 'function') {
			stream.watch(function(err, v) {
				if(err) {
					out.error(err)
				} else {
					values[i] = v
					out.emit([].concat.call(values))
				}
			})
		} else {
			values[i] = stream
		}
	})

	out.emit([].concat.call(values))

	return out
}

module.exports = frp