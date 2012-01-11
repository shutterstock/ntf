var http = require('../lib/ntf/http')
  , mock = require('./assets/mock')

exports.asserts = function(test) {
  test.equal(Object.keys(http.asserts).length, 3)
  test.done()
}

exports.assertsStatusCode = function(test) {
  var statusCode = 200
    , mockTest = new mock.AssertTest(test, http)

  mockTest.statusCode(true, statusCode)
  mockTest.equalEqual(false)

  mockTest.statusCode({}, statusCode)
  mockTest.equalEqual(false)

  mockTest.statusCode({ statusCode: 500 }, statusCode)
  mockTest.equalEqual(false)

  mockTest.statusCode({ statusCode: 200 }, statusCode)
  mockTest.equalEqual()

  test.done()
}

exports.assertsBody = function(test) {
  var content = 'world$'
    , mockTest = new mock.AssertTest(test, http)

  mockTest.body(true, content)
  mockTest.okEqual(false)

  mockTest.body({}, content)
  mockTest.okEqual(false)

  mockTest.body({ data: 'hello world' }, content)
  mockTest.okEqual(false)

  mockTest.body({ data: 'hello world$' }, content)
  mockTest.okEqual()

  mockTest.body({ data: 'hello world' }, /^world/)
  mockTest.okEqual(false)

  mockTest.body({ data: 'hello world' }, /world$/)
  mockTest.okEqual()

  test.done()
}

exports.assertsJson = function(test) {
  var content = { one: { two: 3 } }
    , mockTest = new mock.AssertTest(test, http)

  mockTest.json(true)
  mockTest.okEqual(false)

  mockTest.json({})
  mockTest.okEqual(false)

  mockTest.json({ data: 'not json' })
  mockTest.okEqual(false)

  mockTest.json({ data: 'not json' }, content)
  mockTest.okEqual(false)
  mockTest.deepEqualEqual(false)

  mockTest.json({ data: '{"one":{"two":4}}' }, content)
  mockTest.okEqual()
  mockTest.deepEqualEqual(false)

  mockTest.json({ data: '{"one":{"two":3}}' }, content)
  mockTest.okEqual()
  mockTest.deepEqualEqual()

  test.done()
}
