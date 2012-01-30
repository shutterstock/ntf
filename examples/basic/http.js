var ntf = require('../../lib/ntf')
  , test = ntf.http('https://github.com')

exports.projectPage = test.get('/silas/ntf', function(test, res) {
  test.statusCode(res, 200)
  test.header(res, 'Server', /nginx\/[\d.]+/)
  test.body(res, 'ntf')
  test.done()
})
