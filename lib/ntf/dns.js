var dns = require('dns')
  , util = require('util')
  , utils = require('./utils')

var exports = module.exports = function(opts) {
  if (opts === undefined) {
    opts = {}
  } else if (typeof(opts) === 'string') {
    opts = { authority: opts }
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
    this.ok(typeof(this._ntf) === 'object' &&
      (this._ntf.type == 'a' || this._ntf.type == 'aaaa') &&
      Array.isArray(this._ntf.answer) && this._ntf.answer.length > 0 &&
      this._ntf.answer.indexOf(address) >= 0,
      'Address "' + address + '" in ' + JSON.stringify(this._ntf.answer))
  },
  name: function(name) {
    this.ok(typeof(this._ntf) === 'object' &&
      (this._ntf.type == 'cname' || this._ntf.type == 'ns' || this._ntf.type == 'ptr') &&
      Array.isArray(this._ntf.answer) && this._ntf.answer.length > 0 &&
      this._ntf.answer.indexOf(name) >= 0, 'Name "' + name + '" in ' + JSON.stringify(this._ntf.answer))
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
    test._ntf = { answer: answer, type: opts.type }
    callback(test, answer)
  })
}
