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
  mockTest.assertOk(false)

  mockTest.hasAddress({}, address)
  mockTest.assertOk(false)

  mockTest.hasAddress({ type: 'a', answer: [] }, address)
  mockTest.assertOk(false)

  mockTest.hasAddress({ type: 'a', answer: '127.0.0.1' }, address)
  mockTest.assertOk(false)

  mockTest.hasAddress({ answer: ['127.0.0.1'] }, address)
  mockTest.assertOk(false)

  mockTest.hasAddress({ type: 'a', answer: ['127.0.0.1'] }, address)
  mockTest.assertOk()

  mockTest.hasAddress({ type: 'aaaa', answer: ['127.0.0.1'] }, address)
  mockTest.assertOk()

  test.done()
}

exports.assertsHasName = function(test) {
  var name = 'example.org'
    , mockTest = new mock.AssertTest(test, dns)

  mockTest.hasName(true, name)
  mockTest.assertOk(false)

  mockTest.hasName({}, name)
  mockTest.assertOk(false)

  mockTest.hasName({ type: 'cname', answer: [] }, name)
  mockTest.assertOk(false)

  mockTest.hasName({ type: 'cname', answer: 'example.org' }, name)
  mockTest.assertOk(false)

  mockTest.hasName({ answer: ['example.org'] }, name)
  mockTest.assertOk(false)

  mockTest.hasName({ type: 'cname', answer: ['example.org'] }, name)
  mockTest.assertOk()

  mockTest.hasName({ type: 'ns', answer: ['example.org'] }, name)
  mockTest.assertOk()

  mockTest.hasName({ type: 'ptr', answer: ['example.org'] }, name)
  mockTest.assertOk()

  test.done()
}
