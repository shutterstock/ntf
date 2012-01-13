var http = require('../lib/ntf/http')
  , mock = require('./assets/mock')

exports.asserts = function(test) {
  test.equal(Object.keys(http.asserts).length, 4)
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

exports.assertsHeader = function(test) {
  var mockTest = new mock.AssertTest(test, http)
    , res = { headers: { 'content-length': '334' } }
    , resCookie = { headers: { 'set-cookie': 'name=value' } }
    , resCookies = { headers: { 'set-cookie': ['name1=value1', 'name2=value2'] } }

  mockTest.header(true)
  mockTest.assertOk(false)

  mockTest.header({})
  mockTest.assertOk(false)

  mockTest.header(res)
  mockTest.assertOk(false)

  mockTest.header(res, 'name')
  mockTest.assertOk(false)

  mockTest.header(res, /name/)
  mockTest.assertOk(false)

  mockTest.header(res, 'content-length')
  mockTest.assertOk(false)

  mockTest.header(res, 'content-length', 334)
  mockTest.assertOk(true)

  mockTest.header(resCookie, 'set-cookie', 'name=value')
  mockTest.assertOk(true)

  mockTest.header(resCookies, 'set-cookie', 'name1=value1')
  mockTest.assertOk(true)

  mockTest.header(resCookies, 'set-cookie', 'name2=value2')
  mockTest.assertOk(true)

  test.equal(mockTest.header(resCookie, 'set-cookie', /name=(.*)/)[1], 'value')
  mockTest.assertOk(true)

  test.equal(mockTest.header(resCookies, 'set-cookie', /name1=(.*)/)[1], 'value1')
  mockTest.assertOk(true)

  test.equal(mockTest.header(resCookies, 'set-cookie', /name2=(.*)/)[1], 'value2')
  mockTest.assertOk(true)

  test.equal(mockTest.header(resCookies, 'set-cookie', /name3=(.*)/), null)
  mockTest.assertOk(false)

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
