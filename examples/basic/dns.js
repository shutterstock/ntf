var ntf = require('../../lib/ntf')
  , test = ntf.dns.test(exports)

test.a('a record', 'silas.github.com', function(test, res) {
  test.hasAddress(res, '207.97.227.245')
  test.done()
})

test.cname('cname record', 'silas.sewell.org', function(test, res) {
  test.hasName(res, 'ghs.google.com')
  test.done()
})
