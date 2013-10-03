// skip express tests on 0.7.0
if (process.versions.node.split('.')[1] != '7') {

var assets = require('./assets/http')
  , ntf = require('../../lib')
  , http = ntf.http('http://127.0.0.1:3000')

var form = { hello: 'world' }
  , json = { text: 'abc', number: 123 }

exports.setUp = function(cb) {
  this.server = assets.createServer()
  this.server.listen(3000, '127.0.0.1', cb)
}

exports.tearDown = function(cb) {
  this.server.close()
  cb()
}

exports.getBuffer = http.get({ url: '/buffer', resEncoding: null }, function(test) {
  var body = new Buffer('buffer')
  test.statusCode(200)
  test.deepEqual(test.body(), body)
  test.body(body)
  test.done()
})

exports.getCookie = http.get({ url: '/cookie', cookie: { one: 'two' } }, function(test) {
  var cookies = {
    key: { value: 'value', path: '/' },
    'KeY-oNe': { value: 'value-two', path: '/' }
  }
  test.statusCode(200)
  test.deepEqual(test.cookie().key, cookies.key)
  test.deepEqual(test.cookie('key'), cookies.key)
  test.cookie('key', cookies.key.value)
  test.cookie('key-one', cookies['KeY-oNe'].value)
  test.done()
})

exports.getJson = http.get('/json', function(test) {
  test.statusCode(200)
  test.deepEqual(test.json(), json)
  test.json(json)
  test.jsonPath('$.text', 'abc')
  test.equal(test.jsonPath('$.text'), 'abc')
  test.jsonPath('$.number', 123)
  test.equal(test.jsonPath('$.number'), 123)
  test.done()
})

exports.getSession = http.get({ url: '/session?value=ok', jar: true }, function(test) {
  test.statusCode(200)
  test.jsonPath('$.value', 'none')
  test.get('/session', function(test) {
    test.statusCode(200)
    test.jsonPath('$.value', 'ok')
    test.get({ url: '/session', jar: false }, function(test) {
      test.jsonPath('$.value', 'none')
      test.statusCode(200)
      test.done()
    })
  })
})

exports.postForm = http.post({ url: '/form', body: form, type: 'form' }, function(test) {
  test.statusCode(200)
  test.json(form)
  test.done()
})

exports.postJson = http.post({ url: '/json', body: json, type: 'json' }, function(test) {
  test.statusCode(200)
  test.json(json)
  test.done()
})

}
