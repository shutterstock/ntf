var ntf = require('../lib')
  , test = ntf.dns()

exports.root = test.a('ntfjs.org', function(test) {
  test.address('207.97.227.245')
  test.done()
})

exports.www = test.cname('www.ntfjs.org', function(test) {
  test.name('silas.github.com')
  test.done()
})
