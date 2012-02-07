var dns = require('dns')
  , net = require('net')
  , shared = require('./shared')
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
      opts.url = 'tcp://' + opts.host + ':' + opts.port

      return function(test) {
        test = shared.setupTest(test)
        if (typeof(test._ntf.meta) !== 'object') test._ntf.meta = this.meta || {}
        exports.tcp.apply(this, [test, opts, callback])
      }
    },
  }
}

var asserts = {
  connect: function() {
    this.ok(typeof(this.ntf) === 'object' &&
      this.ntf.connected == true, 'Connected')
  },
}

exports.tcp = function(test, opts, callback) {
  for (var a in asserts) {
    if (!test.hasOwnProperty(a)) test[a] = asserts[a]
  }

  opts.timeout = opts.timeout || 1000

  if (test._ntf.meta.currentTest) {
    if (typeof(test._ntf.meta.test) !== 'object') test._ntf.meta.test = {}
    test._ntf.meta.test[test._ntf.meta.currentTest] = {
      type: 'socket',
      url: opts.url,
      socket_type: 'tcp',
    }
  }

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

    socket.on('connect', function() {
      test.ntf.connected = true
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
