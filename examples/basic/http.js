var ntf = require('../../lib/ntf')
  , test = ntf.http('https://github.com')

exports.projectPage = test.get('/silas/ntf', function(test) {
  test.statusCode(200)
  test.header('Server', /nginx\/[\d.]+/)
  test.body('ntf')
  test.done()
})
