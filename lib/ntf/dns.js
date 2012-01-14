var dns = require('dns')
  , util = require('util')
  , utils = require('./utils')

var asserts = exports.asserts = {
  address: function(res, address) {
    this.ok(typeof(res) === 'object' &&
      (res.type == 'a' || res.type == 'aaaa') &&
      Array.isArray(res.answer) && res.answer.length > 0 &&
      res.answer.indexOf(address) >= 0,
      'Address "' + address + '" in ' + JSON.stringify(res.answer))
  },
  name: function(res, name) {
    this.ok(typeof(res) === 'object' &&
      (res.type == 'cname' || res.type == 'ns' || res.type == 'ptr') &&
      Array.isArray(res.answer) && res.answer.length > 0 &&
      res.answer.indexOf(name) >= 0, 'Name "' + name + '" in ' + JSON.stringify(res.answer))
  },
}

exports.test = function(e, authority) {
  if (authority !== undefined) throw Error('Authority not implemented')

  return {
    a: testType(e, authority, 'a'),
    aaaa: testType(e, authority, 'aaaa'),
    cname: testType(e, authority, 'cname'),
    mx: testType(e, authority, 'mx'),
    ns: testType(e, authority, 'ns'),
    ptr: testType(e, authority, 'ptr'),
    srv: testType(e, authority, 'srv'),
    txt: testType(e, authority, 'txt'),
  }
}

var testType = function(e, authority, type) {
  return function() {
    var baseArgs = Array.prototype.slice.call(arguments)
      , baseUri = 'dns:' + (authority !== undefined ? '//' + authority + '/' : '')
      , name = [baseUri + baseArgs[1] + '?type=' + type, baseArgs[0]].join(utils.SEP)

    // add test to module
    e[name] = function(test) {
      var args = Array.prototype.slice.call(baseArgs)
      args.shift() // remove description
      args.unshift(authority)
      args.unshift(type)
      args.unshift(test)
      exports.resolve.apply(this, args)
    }
  }
}

exports.resolve = function(/* test, type, authority, domain, [opts], callback */) {
  var test = arguments[0]
    , type = arguments[1]
    , authority = arguments[2]
    , domain = arguments[3]
    , opts = {}
    , callback = null

  if (arguments.length == 6) {
    opts = arguments[4]
    callback = arguments[5]
  } else {
    callback = arguments[4]
  }

  for (var a in asserts) {
    if (!test.hasOwnProperty(a)) test[a] = asserts[a]
  }

  dns.resolve(domain, type.toUpperCase(), function(err, answer) {
    if (err) {
      test.ok(false, err)
      return test.done()
    }
    callback(test, { answer: answer, type: type })
  })
}
