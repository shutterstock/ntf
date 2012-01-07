var dns = require('../lib/ntf/dns')

var MockTest = function() {
  var self = this

  Object.keys(dns.asserts).forEach(function(name) {
    self[name] = dns.asserts[name]
  })

  return self
}

MockTest.prototype.ok = function(value) {
  this._last = value
}

MockTest.prototype.last = function(value) {
  var last = this._last
  delete this._last
  return last === value
}

exports.asserts = function(test) {
  test.equal(Object.keys(dns.asserts).length, 2)
  test.done()
}

exports.assertsHasAddress = function(test) {
  var address = '127.0.0.1'
    , mockTest = new MockTest()

  mockTest.hasAddress(true, address)
  test.ok(mockTest.last(false))

  mockTest.hasAddress({}, address)
  test.ok(mockTest.last(false))

  mockTest.hasAddress({ type: 'a', answer: [] }, address)
  test.ok(mockTest.last(false))

  mockTest.hasAddress({ type: 'a', answer: '127.0.0.1' }, address)
  test.ok(mockTest.last(false))

  mockTest.hasAddress({ answer: ['127.0.0.1'] }, address)
  test.ok(mockTest.last(false))

  mockTest.hasAddress({ type: 'a', answer: ['127.0.0.1'] }, address)
  test.ok(mockTest.last(true))

  mockTest.hasAddress({ type: 'aaaa', answer: ['127.0.0.1'] }, address)
  test.ok(mockTest.last(true))

  test.done()
}

exports.assertsHasName = function(test) {
  var name = 'example.org'
    , mockTest = new MockTest()

  mockTest.hasName(true, name)
  test.ok(mockTest.last(false))

  mockTest.hasName({}, name)
  test.ok(mockTest.last(false))

  mockTest.hasName({ type: 'cname', answer: [] }, name)
  test.ok(mockTest.last(false))

  mockTest.hasName({ type: 'cname', answer: 'example.org' }, name)
  test.ok(mockTest.last(false))

  mockTest.hasName({ answer: ['example.org'] }, name)
  test.ok(mockTest.last(false))

  mockTest.hasName({ type: 'cname', answer: ['example.org'] }, name)
  test.ok(mockTest.last(true))

  mockTest.hasName({ type: 'ns', answer: ['example.org'] }, name)
  test.ok(mockTest.last(true))

  mockTest.hasName({ type: 'ptr', answer: ['example.org'] }, name)
  test.ok(mockTest.last(true))

  test.done()
}
