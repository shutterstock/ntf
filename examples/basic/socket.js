var ntf = require('../../lib/ntf')
  , test = ntf.socket.test(exports, 'github.com')

test.tcp('github http', 80, function(test, socket) {
  test.connectionEstablished(socket)
  test.done()
})
