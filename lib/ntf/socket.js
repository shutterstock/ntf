var net = require('net')

var asserts = {
  connectionEstablished: function(socket) {
    if (!socket || !socket._ntf || socket._ntf.connected !== true) {
      this.fail(true, false, '', '==', 'Failed to established connection')
    }
  },
}

exports.test = function(e, host) {
  return {
    tcp: function() {
      var args = Array.prototype.slice.call(arguments)
      e[['tcp://' + host + ':' + args[1], args[0]].join(' | ')] = function(test) {
        args.unshift(host)
        args.unshift(test)
        exports.tcp.apply(this, args)
      }
    },
  }
}

exports.tcp = function(/* test, host, port, [opts], callback */) {
  var test = arguments[0]
    , host = arguments[1]
    , port = arguments[3]
    , opts = {}
    , callback = null

  if (arguments.length == 6) {
    opts = arguments[4]
    callback = arguments[5]
  } else {
    callback = arguments[4]
  }

  for (var a in asserts) {
    if (!test.hasOwnProperty(a)) test[a] = asserts[a]
  }

  opts.timeout = opts.timeout || 1000

  var socket = net.createConnection(port, host)
    , start = new Date().getTime()
    , timedOut = false

  socket._ntf = {}

  socket.on('connect', function() {
    socket._ntf.connected = true
    socket.end()
  })

  socket.on('error', function() {
    // TODO: handle error
  })

  socket.on('close', function() {
    if (!timedOut) callback(test, socket)
  })

  socket.setTimeout(opts.timeout, function() {
    timedOut = true
    test.fail(new Date().getTime() - start, opts.timeout, '', '>=', 'Connection timed out')
    socket.destroy()
    test.done()
  })
}
