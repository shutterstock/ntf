var ntf = require('../lib')
  , test = ntf.http('http://ntfjs.org')

exports.homepage = test.get('/', function(test) {
  test.statusCode(200)
  test.header('Server', /nginx\/[\d.]+/)
  test.body(/<title>(.*)<\/title>/, 'ntf')
  test.done()
})
