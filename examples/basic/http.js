var ntf = require('../../lib/ntf')
  , test = ntf.http.test(exports, 'https://github.com')

test.get('ntf project page', '/silas/ntf', function(test, res) {
  test.statusCode(res, 200)
  test.header(res, 'Server', /nginx\/[\d.]+/)
  test.body(res, 'ntf')
  test.done()
})
