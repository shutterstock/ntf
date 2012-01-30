var ntf = require('../../lib/ntf')
  , test = ntf.socket('github.com')

exports.github = test.tcp(80, function(test, socket) {
  test.connectionEstablished(socket)
  test.done()
})
