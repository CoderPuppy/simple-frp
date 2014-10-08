const test = require('tape')

function wrapTape(t, name) {
	t.sub = function(subName, cb) {
		subName = name + ' ' + subName
		return t.test(subName, function(t) {
			return cb(wrapTape(t, subName))
		})
	}

	return t
}

module.exports = function(name, cb) {
	return test(name, function(t) {
		return cb(wrapTape(t, name))
	})
}