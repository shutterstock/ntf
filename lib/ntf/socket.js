var dns = require('dns')
  , net = require('net')
  , utils = require('./utils')

var exports = module.exports = function(parentOpts) {
  if (typeof(parentOpts) === 'string') {
    parentOpts = { host: parentOpts }
  }
  return {
    tcp: function(opts, callback) {
      if (typeof(opts) === 'number') {
        opts = { port: opts }
      }
      opts.host = parentOpts.host
      opts.uri = 'tcp://' + opts.host + ':' + opts.port

      // add test to module
      return function(test) {
        exports.tcp.apply(this, [test, opts, callback])
      }
    },
  }
}

var asserts = {
  connect: function() {
    this.ok(typeof(this._ntf) === 'object' &&
      this._ntf.connected == true, 'Connected')
  },
}

exports.tcp = function(test, opts, callback) {
  for (var a in asserts) {
    if (!test.hasOwnProperty(a)) test[a] = asserts[a]
  }

  opts.timeout = opts.timeout || 1000

  dns.lookup(opts.host, function(err, ip) {
    if (err) {
      test.ok(false, err)
      return test.done()
    }

    var socket = net.createConnection(opts.port, ip)
      , start = new Date().getTime()
      , done = false

    socket.on('error', function(err) {
      if (!done) {
        done = true
        test.ok(false, err)
        test.done()
      }
    })

    test._ntf = {}

    socket.on('connect', function() {
      test._ntf.connected = true
      socket.end()
    })

    socket.on('close', function() {
      if (!done) {
        done = true
        callback(test, socket)
      }
    })

    socket.setTimeout(opts.timeout, function() {
      if (!done) {
        test.fail(new Date().getTime() - start, opts.timeout, '', '>=', 'Connection timed out')
        socket.destroy()
        test.done()
      }
    })
  })
}
