var ntf = require('../../lib/ntf')
  , test = ntf.socket.test(exports, 'silas.sewell.org')

test.tcp('http', 80, function(test, socket) {
  test.connectionEstablished(socket)
  test.done()
})
