var dns = require('../lib/dns')
  , mock = require('./assets/mock')

exports.asserts = function(test) {
  test.equal(Object.keys(dns.asserts).length, 3)
  test.done()
}

exports.assertsAddress = function(test) {
  var address = '127.0.0.1'
    , mockTest = new mock.AssertTest(test, dns)

  mockTest.ntf = {}
  mockTest.address(address)
  mockTest.assertOk(false)

  mockTest.ntf = { res: {} }
  mockTest.address(address)
  mockTest.assertOk(false)

  mockTest.ntf = { res: { type: 'a', answer: [] } }
  mockTest.address(address)
  mockTest.assertOk(false)

  mockTest.ntf = { res: { type: 'a', answer: '127.0.0.1' } }
  mockTest.address(address)
  mockTest.assertOk(false)

  mockTest.ntf = { res: { answer: ['127.0.0.1'] } }
  mockTest.address(address)
  mockTest.assertOk(false)

  mockTest.ntf = { res: { type: 'a', answer: ['127.0.0.1'] } }
  mockTest.address(address)
  mockTest.assertOk()

  mockTest.ntf = { res: { type: 'aaaa', answer: ['127.0.0.1'] } }
  mockTest.address(address)
  mockTest.assertOk()

  test.done()
}

exports.assertsAnswer = function(test) {
  var mockTest = new mock.AssertTest(test, dns)

  mockTest.ntf = {}
  test.strictEqual(mockTest.answer(), undefined)

  mockTest.ntf = { res: {} }
  test.strictEqual(mockTest.answer(), undefined)

  mockTest.ntf = { res: { answer: [] } }
  test.deepEqual(mockTest.answer(), [])

  test.done()
}

exports.assertsName = function(test) {
  var name = 'example.org'
    , mockTest = new mock.AssertTest(test, dns)

  mockTest.ntf = {}
  mockTest.name(name)
  mockTest.assertOk(false)

  mockTest.ntf = { res: { type: 'cname', answer: [] } }
  mockTest.name(name)
  mockTest.assertOk(false)

  mockTest.ntf = { res: { type: 'cname', answer: 'example.org' } }
  mockTest.name(name)
  mockTest.assertOk(false)

  mockTest.ntf = { res: { answer: ['example.org'] } }
  mockTest.name(name)
  mockTest.assertOk(false)

  mockTest.ntf = { res: { type: 'cname', answer: ['example.org'] } }
  mockTest.name(name)
  mockTest.assertOk()

  mockTest.ntf = { res: { type: 'ns', answer: ['example.org'] } }
  mockTest.name(name)
  mockTest.assertOk()

  mockTest.ntf = { res: { type: 'ptr', answer: ['example.org'] } }
  mockTest.name(name)
  mockTest.assertOk()

  test.done()
}
