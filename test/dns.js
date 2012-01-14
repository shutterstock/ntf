var dns = require('../lib/ntf/dns')
  , mock = require('./assets/mock')

exports.asserts = function(test) {
  test.equal(Object.keys(dns.asserts).length, 2)
  test.done()
}

exports.assertsAddress = function(test) {
  var address = '127.0.0.1'
    , mockTest = new mock.AssertTest(test, dns)

  mockTest.address(true, address)
  mockTest.assertOk(false)

  mockTest.address({}, address)
  mockTest.assertOk(false)

  mockTest.address({ type: 'a', answer: [] }, address)
  mockTest.assertOk(false)

  mockTest.address({ type: 'a', answer: '127.0.0.1' }, address)
  mockTest.assertOk(false)

  mockTest.address({ answer: ['127.0.0.1'] }, address)
  mockTest.assertOk(false)

  mockTest.address({ type: 'a', answer: ['127.0.0.1'] }, address)
  mockTest.assertOk()

  mockTest.address({ type: 'aaaa', answer: ['127.0.0.1'] }, address)
  mockTest.assertOk()

  test.done()
}

exports.assertsName = function(test) {
  var name = 'example.org'
    , mockTest = new mock.AssertTest(test, dns)

  mockTest.name(true, name)
  mockTest.assertOk(false)

  mockTest.name({}, name)
  mockTest.assertOk(false)

  mockTest.name({ type: 'cname', answer: [] }, name)
  mockTest.assertOk(false)

  mockTest.name({ type: 'cname', answer: 'example.org' }, name)
  mockTest.assertOk(false)

  mockTest.name({ answer: ['example.org'] }, name)
  mockTest.assertOk(false)

  mockTest.name({ type: 'cname', answer: ['example.org'] }, name)
  mockTest.assertOk()

  mockTest.name({ type: 'ns', answer: ['example.org'] }, name)
  mockTest.assertOk()

  mockTest.name({ type: 'ptr', answer: ['example.org'] }, name)
  mockTest.assertOk()

  test.done()
}
