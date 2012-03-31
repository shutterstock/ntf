var http = require('../lib/http')
  , mock = require('./assets/mock')

exports.asserts = function(test) {
  test.equal(Object.keys(http.asserts).length, 5)
  test.done()
}

exports.assertsStatusCode = function(test) {
  var statusCode = 200
    , mockTest = new mock.AssertTest(test, http)

  mockTest.ntf = { res: {} }
  mockTest.statusCode(statusCode)
  mockTest.assertEqual(false)

  mockTest.ntf = { res: { statusCode: 500 } }
  mockTest.statusCode(statusCode)
  mockTest.assertEqual(false)

  mockTest.ntf = { res: { statusCode: 200 } }
  mockTest.statusCode(statusCode)
  mockTest.assertEqual()

  test.done()
}

exports.assertsHeader = function(test) {
  var mockTest = new mock.AssertTest(test, http)
    , res = { res: { headers: { 'content-length': '334' } } }
    , resCookie = { res: { headers: { 'set-cookie': 'name=value' } } }
    , resCookies = { res: { headers: { 'set-cookie': ['name1=value1', 'name2=value2'] } } }

  mockTest.ntf = {}
  test.equal(mockTest.header(), undefined)

  mockTest.ntf = res
  test.deepEqual(mockTest.header(), res.res.headers)

  mockTest.ntf = res
  mockTest.header('name')
  mockTest.assertOk(false)

  mockTest.ntf = res
  mockTest.header(/name/)
  mockTest.assertOk(false)

  mockTest.ntf = res
  test.equal(mockTest.header('content-length'), '334')
  mockTest.assertOk(true)

  mockTest.ntf = res
  mockTest.header('content-length', 334)
  mockTest.assertOk(true)

  mockTest.ntf = resCookie
  mockTest.header('set-cookie', 'name=value')
  mockTest.assertOk(true)

  mockTest.ntf = resCookies
  mockTest.header('set-cookie', 'name1=value1')
  mockTest.assertOk(true)

  mockTest.ntf = resCookies
  mockTest.header('set-cookie', 'name2=value2')
  mockTest.assertOk(true)

  mockTest.ntf = resCookie
  test.equal(mockTest.header('set-cookie', /name=(.*)/)[1], 'value')
  mockTest.assertOk(true)

  mockTest.ntf = resCookies
  test.equal(mockTest.header('set-cookie', /name1=(.*)/)[1], 'value1')
  mockTest.assertOk(true)

  mockTest.ntf = resCookies
  test.equal(mockTest.header('set-cookie', /name2=(.*)/)[1], 'value2')
  mockTest.assertOk(true)

  mockTest.ntf = resCookie
  test.equal(mockTest.header('set-cookie', /name3=(.*)/), null)
  mockTest.assertOk(false)

  test.done()
}

exports.assertsBody = function(test) {
  var content = 'world$'
    , mockTest = new mock.AssertTest(test, http)

  mockTest.ntf = {}
  mockTest.body(content)
  mockTest.assertOk(false)

  mockTest.ntf = { body: 'hello world' }
  mockTest.body(content)
  mockTest.assertOk(false)

  mockTest.ntf = { body: 'hello world$' }
  mockTest.body(content)
  mockTest.assertOk()

  mockTest.ntf = { body: 'hello world' }
  mockTest.body(/^world/)
  mockTest.assertOk(false)

  mockTest.ntf = { body: 'hello world' }
  mockTest.body(/world$/)
  mockTest.assertOk()

  test.done()
}

exports.assertsJson = function(test) {
  var content = { one: { two: 3 } }
    , mockTest = new mock.AssertTest(test, http)

  mockTest.ntf = true
  mockTest.json()
  mockTest.assertOk(false)

  mockTest.ntf = {}
  mockTest.json()
  mockTest.assertOk(false)

  mockTest.ntf = { body: 'not json' }
  mockTest.json()
  mockTest.assertOk(false)

  mockTest.ntf = { body: 'not json' }
  mockTest.json(content)
  mockTest.assertOk(false)
  mockTest.assertDeepEqual(false)

  mockTest.ntf = { body: '{"one":{"two":4}}' }
  mockTest.json(content)
  mockTest.assertOk()
  mockTest.assertDeepEqual(false)

  mockTest.ntf = { body: '{"one":{"two":3}}' }
  mockTest.json(content)
  mockTest.assertOk()
  mockTest.assertDeepEqual()

  test.done()
}

exports.assertsJsonPath = function(test) {
  var mockTest = new mock.AssertTest(test, http)

  mockTest.ntf = true
  mockTest.jsonPath()
  mockTest.assertOk(false)

  mockTest.ntf = {}
  mockTest.jsonPath()
  mockTest.assertOk(false)

  mockTest.ntf = { body: 'not json' }
  mockTest.jsonPath()
  mockTest.assertOk(false)

  mockTest.ntf = { body: 'not json' }
  mockTest.jsonPath('$.one.two', 3)
  mockTest.assertOk(false)
  mockTest.assertDeepEqual(false)

  mockTest.ntf = { body: '{ "one": { "two": 3 }, "three": { "two": 2 } }' }

  mockTest.jsonPath('$.one', { two: 3 })
  mockTest.assertOk(true)
  mockTest.assertDeepEqual(true)

  mockTest.jsonPath('$.one.two', 3)
  mockTest.assertDeepEqual(true)

  mockTest.jsonPath('$.*.two', 3, 2)
  mockTest.assertDeepEqual(true)
  mockTest.assertDeepEqual(true)

  mockTest.jsonPath('$.*.two', 2, 2)
  mockTest.assertDeepEqual(false)
  mockTest.assertDeepEqual(true)

  test.done()
}
