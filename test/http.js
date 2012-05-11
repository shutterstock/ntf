var http = require('../lib/http')
  , mock = require('./assets/mock')
  , nock = require('nock')

exports.asserts = function(test) {
  test.equal(Object.keys(http.asserts).length, 6)
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

  mockTest.ntf = { body: new Buffer('hello world') }
  mockTest.body(new Buffer('fail'))
  mockTest.assertDeepEqual(false)

  mockTest.ntf = { body: new Buffer('hello world') }
  mockTest.body(new Buffer('hello world'))
  mockTest.assertDeepEqual()

  mockTest.ntf = { body: 'one two' }
  mockTest.body(/^one (.*) three$/, 'two')
  mockTest.assertOk(false)
  mockTest.assertEqual(false)

  mockTest.ntf = { body: 'one fail three' }
  mockTest.body(/^one (.*) three$/, 'two')
  mockTest.assertOk()
  mockTest.assertEqual(false)

  mockTest.ntf = { body: 'zero one two three' }
  mockTest.body(/^zero (.*) (.*) (.*)/, 'one', 'two', 'three')
  mockTest.assertOk()
  mockTest.assertEqual()
  mockTest.assertEqual()
  mockTest.assertEqual()

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

exports.assertsCookie = function(test) {
  var mockTest = new mock.AssertTest(test, http)
    , resCookie = { headers: { 'set-cookie': 'name=value; path=/; expires=Mon, 30-Apr-2012 04:21:16 GMT' } }
    , resCookies = { headers: { 'set-cookie': [
        'name1=value1; expires=Sun, 30-Sep-2012 16:41:40 GMT; path=/; domain=.example.com; HttpOnly',
        'name2=value2; path=/; expires=Sat, 01-Jan-2022 00:00:00 GMT; secure; HttpOnly'
      ] } }
    , resCookieDecoded = { name: { value: 'value', path: '/', expires: new Date(1335759676000) } }

  mockTest.ntf = { res: resCookie }
  mockTest.cookie('name1')
  mockTest.assertOk(false)

  mockTest.ntf = { res: resCookie }
  mockTest.cookie(/name1/)
  mockTest.assertOk(false)

  mockTest.ntf = { res: resCookie }
  test.deepEqual(mockTest.cookie('name'), resCookieDecoded.name)
  mockTest.assertOk(true)

  mockTest.ntf = { res: resCookie }
  mockTest.cookie('name', 'value')
  mockTest.assertOk(true)

  mockTest.ntf = { res: resCookies }
  mockTest.cookie('name1', 'nope')
  mockTest.assertOk(false)
  mockTest.cookie('name2', 'value2')
  mockTest.assertOk(true)

  mockTest.ntf = { res: resCookies }
  mockTest.cookie('name1', 'value1')
  mockTest.assertOk(true)
  mockTest.cookie('name2', 'value2')
  mockTest.assertOk(true)

  mockTest.ntf = { res: resCookies }
  test.equal(mockTest.cookie('name1', /value(\d+)/)[1], '1')
  mockTest.assertOk(true)
  test.equal(mockTest.cookie('name2', /(\d+)/)[1], '2')
  mockTest.assertOk(true)

  test.done()
}

exports.del = function(test) {
  var mt = new mock.HttpAssertTest(test, http)
    , opts = { url: 'http://example.org' }

  mt._ntf.parentOpts = opts

  nock(opts.url)
    .delete('/')
    .reply(200, 'root')
    .delete('/one')
    .reply(404, 'one')

  http.del(mt, opts, function(mt) {
    mt.statusCode(200)
    mt.assertEqual(true)
    mt.del('/one', function(mt) {
      mt.statusCode(404)
      mt.assertEqual(true)
      test.done()
    })
  })
}

exports.get = function(test) {
  var mt = new mock.HttpAssertTest(test, http)
    , opts = { url: 'http://example.org', jar: true }

  mt._ntf.parentOpts = opts

  nock(opts.url)
    .get('/')
    .reply(200, 'hello world', {
      'set-cookie': [
        'name1=value; path=/; expires=Mon, 30-Apr-2012 04:21:16 GMT',
        'name2=value2; path=/; expires=Mon, 30-Apr-2012 04:21:16 GMT'
      ]
    })
    .get('/one')
    .reply(404, { message: 'not found' }, {
      'set-cookie': 'name1=value1; path=/; expires=Mon, 30-Apr-2012 04:21:16 GMT',
      'content-type': 'application/json'
    })
    .get('/two')
    .reply(200, '')

  http.get(mt, opts, function(mt) {
    // status
    mt.statusCode(200)
    mt.assertEqual(true)
    mt.statusCode(500)
    mt.assertEqual(false)
    // body
    mt.body('hello')
    mt.assertOk(true)
    test.equal(mt.body(/^hello (.*)$/)[1], 'world')
    mt.assertOk(true)
    // cookie
    test.deepEqual(mt.cookie('name1'), {
      value: 'value',
      path: '/',
      expires: new Date(1335759676000)
    })
    mt.assertOk(true)
    mt.cookie('name1', 'value')
    mt.assertOk(true)
    mt.get('/one', function(mt) {
      test.equal(mt.ntf.httpOpts.headers.cookie, 'name1=value; name2=value2')
      mt.statusCode(404)
      mt.assertEqual(true)
      mt.json({ message: 'not found' })
      mt.assertOk(true)
      mt.assertDeepEqual(true)
      mt.jsonPath('$.message', 'not found')
      mt.assertDeepEqual(true)
      mt.get('/two', function(mt) {
        test.equal(mt.ntf.httpOpts.headers.cookie, 'name1=value1; name2=value2')
        mt.statusCode(200)
        mt.assertEqual(true)
        test.done()
      })
    })
  })
}

exports.head = function(test) {
  var mt = new mock.HttpAssertTest(test, http)
    , opts = { url: 'http://example.org' }

  mt._ntf.parentOpts = opts

  nock(opts.url)
    .head('/')
    .reply(200, 'root')
    .head('/one')
    .reply(404, 'one')

  http.head(mt, opts, function(mt) {
    mt.statusCode(200)
    mt.assertEqual(true)
    mt.head('/one', function(mt) {
      mt.statusCode(404)
      mt.assertEqual(true)
      test.done()
    })
  })
}

exports.options = function(test) {
  var mt = new mock.HttpAssertTest(test, http)
    , opts = { url: 'http://example.org' }

  mt._ntf.parentOpts = opts

  nock(opts.url)
    .intercept('/', 'OPTIONS', '', {})
    .reply(200, 'root')
    .intercept('/one', 'OPTIONS', '', {})
    .reply(404, 'one')

  http.options(mt, opts, function(mt) {
    mt.statusCode(200)
    mt.assertEqual(true)
    mt.options('/one', function(mt) {
      mt.statusCode(404)
      mt.assertEqual(true)
      test.done()
    })
  })
}

exports.patch = function(test) {
  var mt = new mock.HttpAssertTest(test, http)
    , opts = { url: 'http://example.org' }

  mt._ntf.parentOpts = opts

  nock(opts.url)
    .intercept('/', 'PATCH', '', {})
    .reply(200, 'root')
    .intercept('/one', 'PATCH', '', {})
    .reply(404, 'one')

  http.patch(mt, opts, function(mt) {
    mt.statusCode(200)
    mt.assertEqual(true)
    mt.patch('/one', function(mt) {
      mt.statusCode(404)
      mt.assertEqual(true)
      test.done()
    })
  })
}

exports.post = function(test) {
  var mt = new mock.HttpAssertTest(test, http)
    , opts = { url: 'http://example.org' }

  mt._ntf.parentOpts = opts

  nock(opts.url)
    .post('/')
    .reply(200, 'root')
    .post('/one')
    .reply(404, 'one')

  http.post(mt, opts, function(mt) {
    mt.statusCode(200)
    mt.assertEqual(true)
    mt.post('/one', function(mt) {
      mt.statusCode(404)
      mt.assertEqual(true)
      test.done()
    })
  })
}

exports.put = function(test) {
  var mt = new mock.HttpAssertTest(test, http)
    , opts = { url: 'http://example.org' }

  mt._ntf.parentOpts = opts

  nock(opts.url)
    .put('/')
    .reply(200, 'root')
    .put('/one')
    .reply(404, 'one')

  http.put(mt, opts, function(mt) {
    mt.statusCode(200)
    mt.assertEqual(true)
    mt.put('/one', function(mt) {
      mt.statusCode(404)
      mt.assertEqual(true)
      test.done()
    })
  })
}
