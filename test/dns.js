var dns = require('../lib/ntf/dns')
  , mock = require('./assets/mock')

exports.asserts = function(test) {
  test.equal(Object.keys(dns.asserts).length, 2)
  test.done()
}

exports.assertsAddress = function(test) {
  var address = '127.0.0.1'
    , mockTest = new mock.AssertTest(test, dns)

  mockTest._ntf = true
  mockTest.address(address)
  mockTest.assertOk(false)

  mockTest._ntf = {}
  mockTest.address(address)
  mockTest.assertOk(false)

  mockTest._ntf = { type: 'a', answer: [] }
  mockTest.address(address)
  mockTest.assertOk(false)

  mockTest._ntf = { type: 'a', answer: '127.0.0.1' }
  mockTest.address(address)
  mockTest.assertOk(false)

  mockTest._ntf = { answer: ['127.0.0.1'] }
  mockTest.address(address)
  mockTest.assertOk(false)

  mockTest._ntf = { type: 'a', answer: ['127.0.0.1'] }
  mockTest.address(address)
  mockTest.assertOk()

  mockTest._ntf = { type: 'aaaa', answer: ['127.0.0.1'] }
  mockTest.address(address)
  mockTest.assertOk()

  test.done()
}

exports.assertsName = function(test) {
  var name = 'example.org'
    , mockTest = new mock.AssertTest(test, dns)

  mockTest._ntf = true
  mockTest.name(name)
  mockTest.assertOk(false)

  mockTest._ntf = {}
  mockTest.name(name)
  mockTest.assertOk(false)

  mockTest._ntf = { type: 'cname', answer: [] }
  mockTest.name(name)
  mockTest.assertOk(false)

  mockTest._ntf = { type: 'cname', answer: 'example.org' }
  mockTest.name(name)
  mockTest.assertOk(false)

  mockTest._ntf = { answer: ['example.org'] }
  mockTest.name(name)
  mockTest.assertOk(false)

  mockTest._ntf = { type: 'cname', answer: ['example.org'] }
  mockTest.name(name)
  mockTest.assertOk()

  mockTest._ntf = { type: 'ns', answer: ['example.org'] }
  mockTest.name(name)
  mockTest.assertOk()

  mockTest._ntf = { type: 'ptr', answer: ['example.org'] }
  mockTest.name(name)
  mockTest.assertOk()

  test.done()
}
