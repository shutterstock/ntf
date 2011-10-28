var ntf = require('../../lib/ntf')
  , test = ntf.http.test(exports, 'http://silas.sewell.org')

test.get('homepage', '/', function(test, res) {
  test.statusCode(res, 200)
  test.hasContent(res, 'Silas Sewell')
  test.done()
})
