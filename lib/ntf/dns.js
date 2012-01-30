var dns = require('dns')
  , util = require('util')
  , utils = require('./utils')

var exports = module.exports = function(opts) {
  if (opts === undefined) {
    opts = {}
  } else if (typeof(opts) === 'string') {
    opts = opts = { authority: opts }
  }
  if (opts.authority !== undefined) throw Error('Authority not implemented')

  return {
    a: testType(opts, 'a'),
    aaaa: testType(opts, 'aaaa'),
    cname: testType(opts, 'cname'),
    mx: testType(opts, 'mx'),
    ns: testType(opts, 'ns'),
    ptr: testType(opts, 'ptr'),
    srv: testType(opts, 'srv'),
    txt: testType(opts, 'txt'),
  }
}

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

var testType = function(parentOpts, type) {
  return function(opts, callback) {
    if (typeof(opts) === 'string') opts = { domain: opts }
    opts.type = type
    opts.uri = 'dns:' +
      (opts.authority !== undefined ? '//' + opts.authority + '/' : '') +
      opts.domain + '?type=' + type

    // add test to module
    return function(test) {
      exports.resolve(test, opts, callback)
    }
  }
}

exports.resolve = function(test, opts, callback) {
  for (var a in asserts) {
    if (!test.hasOwnProperty(a)) test[a] = asserts[a]
  }

  dns.resolve(opts.domain, opts.type.toUpperCase(), function(err, answer) {
    if (err) {
      test.ok(false, err)
      return test.done()
    }
    callback(test, { answer: answer, type: opts.type })
  })
}
