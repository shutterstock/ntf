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
  mockTest.assertEqual(false)

  mockTest.statusCode({}, statusCode)
  mockTest.assertEqual(false)

  mockTest.statusCode({ statusCode: 500 }, statusCode)
  mockTest.assertEqual(false)

  mockTest.statusCode({ statusCode: 200 }, statusCode)
  mockTest.assertEqual()

  test.done()
}

exports.assertsBody = function(test) {
  var content = 'world$'
    , mockTest = new mock.AssertTest(test, http)

  mockTest.body(true, content)
  mockTest.assertOk(false)

  mockTest.body({}, content)
  mockTest.assertOk(false)

  mockTest.body({ data: 'hello world' }, content)
  mockTest.assertOk(false)

  mockTest.body({ data: 'hello world$' }, content)
  mockTest.assertOk()

  mockTest.body({ data: 'hello world' }, /^world/)
  mockTest.assertOk(false)

  mockTest.body({ data: 'hello world' }, /world$/)
  mockTest.assertOk()

  test.done()
}

exports.assertsJson = function(test) {
  var content = { one: { two: 3 } }
    , mockTest = new mock.AssertTest(test, http)

  mockTest.json(true)
  mockTest.assertOk(false)

  mockTest.json({})
  mockTest.assertOk(false)

  mockTest.json({ data: 'not json' })
  mockTest.assertOk(false)

  mockTest.json({ data: 'not json' }, content)
  mockTest.assertOk(false)
  mockTest.assertDeepEqual(false)

  mockTest.json({ data: '{"one":{"two":4}}' }, content)
  mockTest.assertOk()
  mockTest.assertDeepEqual(false)

  mockTest.json({ data: '{"one":{"two":3}}' }, content)
  mockTest.assertOk()
  mockTest.assertDeepEqual()

  test.done()
}
