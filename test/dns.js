var dns = require('../lib/ntf/dns')
  , mock = require('./assets/mock')

exports.asserts = function(test) {
  test.equal(Object.keys(dns.asserts).length, 2)
  test.done()
}

exports.assertsHasAddress = function(test) {
  var address = '127.0.0.1'
    , mockTest = new mock.AssertTest(test, dns)

  mockTest.hasAddress(true, address)
  mockTest.okEqual(false)

  mockTest.hasAddress({}, address)
  mockTest.okEqual(false)

  mockTest.hasAddress({ type: 'a', answer: [] }, address)
  mockTest.okEqual(false)

  mockTest.hasAddress({ type: 'a', answer: '127.0.0.1' }, address)
  mockTest.okEqual(false)

  mockTest.hasAddress({ answer: ['127.0.0.1'] }, address)
  mockTest.okEqual(false)

  mockTest.hasAddress({ type: 'a', answer: ['127.0.0.1'] }, address)
  mockTest.okEqual()

  mockTest.hasAddress({ type: 'aaaa', answer: ['127.0.0.1'] }, address)
  mockTest.okEqual()

  test.done()
}

exports.assertsHasName = function(test) {
  var name = 'example.org'
    , mockTest = new mock.AssertTest(test, dns)

  mockTest.hasName(true, name)
  mockTest.okEqual(false)

  mockTest.hasName({}, name)
  mockTest.okEqual(false)

  mockTest.hasName({ type: 'cname', answer: [] }, name)
  mockTest.okEqual(false)

  mockTest.hasName({ type: 'cname', answer: 'example.org' }, name)
  mockTest.okEqual(false)

  mockTest.hasName({ answer: ['example.org'] }, name)
  mockTest.okEqual(false)

  mockTest.hasName({ type: 'cname', answer: ['example.org'] }, name)
  mockTest.okEqual()

  mockTest.hasName({ type: 'ns', answer: ['example.org'] }, name)
  mockTest.okEqual()

  mockTest.hasName({ type: 'ptr', answer: ['example.org'] }, name)
  mockTest.okEqual()

  test.done()
}
