var net = require('net')
  , utils = require('./utils')

var asserts = {
  connectionEstablished: function(socket) {
    this.ok(!socket || !socket._ntf || socket._ntf.connected == true, 'Established connection')
  },
}

exports.test = function(e, host) {
  return {
    tcp: function() {
      var baseArgs = Array.prototype.slice.call(arguments)
        , name = ['tcp://' + host + ':' + baseArgs[1], baseArgs[0]].join(utils.SEP)

      // add test to module
      e[name] = function(test) {
        var args = Array.prototype.slice.call(baseArgs)
        args.shift() // remove description
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
    , port = arguments[2]
    , opts = {}
    , callback = null

  if (arguments.length == 5) {
    opts = arguments[3]
    callback = arguments[4]
  } else {
    callback = arguments[3]
  }

  for (var a in asserts) {
    if (!test.hasOwnProperty(a)) test[a] = asserts[a]
  }

  opts.timeout = opts.timeout || 1000

  var socket = net.createConnection(port, host)
    , start = new Date().getTime()
    , done = false

  socket._ntf = {}

  socket.on('connect', function() {
    socket._ntf.connected = true
    socket.end()
  })

  socket.on('error', function(err) {
    if (!done) {
      done = true
      test.ok(false, err)
      test.done()
    }
  })

  socket.on('close', function() {
    if (!done) {
      done = true
      callback(test, socket)
    }
  })

  socket.setTimeout(opts.timeout, function() {
    test.fail(new Date().getTime() - start, opts.timeout, '', '>=', 'Connection timed out')
    if (!done) {
      socket.destroy()
      test.done()
    }
  })
}
