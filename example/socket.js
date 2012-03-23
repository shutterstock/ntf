var ntf = require('../lib')
  , test = ntf.socket('ntfjs.org')

exports.http = test.tcp(80, function(test) {
  test.connect()
  test.done()
})
