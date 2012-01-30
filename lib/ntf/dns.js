var dns = require('dns')
  , util = require('util')
  , utils = require('./utils')

var exports = module.exports = function(opts) {
  switch (typeof(opts)) {
    case 'undefined':
      opts = {}
      break
    case 'string':
      opts = { authority: opts }
      break
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
  address: function(address) {
    var res = this._ntf.res
      , hasRes = typeof(res) === 'object'
    this.ok(hasRes && (res.type == 'a' || res.type == 'aaaa') &&
      Array.isArray(res.answer) && res.answer.length > 0 &&
      res.answer.indexOf(address) >= 0,
      'Address "' + address + '" in ' + JSON.stringify(hasRes ? res.answer : []))
  },
  name: function(name) {
    var res = this._ntf.res
      , hasRes = typeof(res) === 'object'
    this.ok(hasRes &&
      (res.type == 'cname' || res.type == 'ns' || res.type == 'ptr') &&
      Array.isArray(res.answer) && res.answer.length > 0 &&
      res.answer.indexOf(name) >= 0, 'Name "' + name + '" in ' +
        JSON.stringify(hasRes ? res.answer : []))
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
      test._ntf = {}
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
    test._ntf.res = { answer: answer, type: opts.type }
    callback(test, test._ntf.res)
  })
}
