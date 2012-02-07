var http = require('http')
  , https = require('https')
  , shared = require('./shared')
  , urlLib = require('url')
  , utils = require('./utils')

var exports = module.exports = function(opts) {
  if (typeof(opts) === 'string') opts = { url: opts }
  return {
    del: testType(opts, 'del'),
    get: testType(opts, 'get'),
    post: testType(opts, 'post'),
    put: testType(opts, 'put'),
  }
}

var asserts = exports.asserts = {
  statusCode: function(statusCode) {
    var res = this._ntf.res
    this.equal(typeof(res) === 'object' ? res.statusCode : undefined,
      statusCode, 'Status code is ' + statusCode)
  },
  header: function(name, match) {
    var res = this._ntf.res
    var result = typeof(res) === 'object' &&
      typeof(res.headers) === 'object'
    if (name === undefined) {
      return result ? res.headers : undefined
    }
    result = result && typeof(name) === 'string' &&
      (name = name.toLowerCase()) &&
      res.headers.hasOwnProperty(name)
    if (match === undefined) {
      this.ok(result, 'Header[' + name + '] exists')
      return result ? res.headers[name] : undefined
    }
    if (result) {
      var values = res.headers[name]
      if (!Array.isArray(values)) values = [values]
      for (var i in values) {
        var v = values[i]
        result = (match instanceof RegExp) ? v.match(match) : v == match
        if (result) break
      }
    }
    this.ok(result, 'Header[' + name + '] matches "' + match + '"')
    if (Array.isArray(result)) return result
  },
  body: function(match) {
    if (match === undefined) return this._ntf.data
    var data = this._ntf.data
    var result = typeof(data) === 'string' &&
      (match instanceof RegExp ? data.match(match) : data.indexOf(match) >= 0)
    this.ok(result, 'Content matches "' + match + '"')
    if (Array.isArray(result)) return result
  },
  json: function(match) {
    var result = undefined
      , data = this._ntf.data
    try {
      result = JSON.parse(data)
    } catch(err) {}
    this.ok(result !== undefined, 'Content is JSON')
    if (match !== undefined) {
      this.deepEqual(result, match)
    }
    return result
  },
}

var testType = function(parentOpts, type) {
  return function(opts, callback) {
    if (typeof(opts) !== 'object') opts = { url: opts }
    opts.url = (parentOpts.url || '') + opts.url

    return function(test) {
      shared.setupTest(test)
      exports[type].call(this, test, opts, callback)
    }
  }
}

exports.request = function(test, opts, callback) {
  // ensure valid timeout
  if (typeof(opts.timeout) !== 'number') opts.timeout = 5000

  var url = urlLib.parse(opts.url)

  if (test._ntf.meta.currentTest) {
    test._ntf.meta.test[test._ntf.meta.currentTest] = {
      type: 'http',
      url: opts.url,
      http_method: opts.method,
    }
  }

  for (var a in asserts) {
    if (!test.hasOwnProperty(a)) test[a] = asserts[a]
  }

  // build http(s).request parameters using url and options
  var httpOpts = test._ntf.httpOpts = {
    host: url.hostname,
    port: url.port,
    headers: opts.headers || {},
    path: (url.pathname || '') + (url.search || ''),
    method: opts.method.toUpperCase(),
  }
  if (!httpOpts.port) {
    if (url.protocol == 'http:') {
      httpOpts.port = 80
    } else if (url.protocol == 'https:') {
      httpOpts.port = 443
    }
  }
  if (opts.auth || url.auth) {
    httpOpts.headers.Authorization = 'Basic ' +
      new Buffer(opts.auth || url.auth).toString('base64')
  }
  if (!opts.handle && typeof(httpOpts.headers['Content-Length']) === 'undefined') {
    httpOpts.headers['Content-Length'] = opts.data ?
      Buffer.byteLength(opts.data, opts.reqEncoding || 'utf8') : 0
  }

  var req = test._ntf.req = url.protocol == 'https:' ?
    https.request(httpOpts) : http.request(httpOpts)

  test._ntf.reqDone = false
  test._ntf.reqClosed = false

  test._ntf.teardown = function() {
    if (!test._ntf.reqClosed) {
      test._ntf.reqClosed = true
      req.end()
    }
  }

  // fail test on http errors
  req.on('error', function (err) {
    if (!test._ntf.reqDone) {
      test._ntf.reqDone = true
      test.ok(false, err)
      test.done()
    }
  })

  // add timeout if not explicitly disabled, if timeout is raised the test
  // will stop and fail immediately
  if (opts.timeout > 0) {
    var start = new Date().getTime()

    var reqTimeout = setTimeout(function() {
      req.emit('reqTimeout')
    }, opts.timeout)

    req.on('reqTimeout', function() {
      if (!test._ntf.reqDone) {
        test._ntf.reqDone = true
        test.fail(new Date().getTime() - start, opts.timeout, '', '>=',
          'Request timed out')
        test.done()
      }
    })
  }

  req.on('response', function (res) {
    test._ntf.res = res

    if (!opts.handle || opts.handleData) {
      test._ntf.data = ''
      res.setEncoding(opts.resEncoding || 'utf8')
      res.on('data', function (chunk) {
        test._ntf.data += chunk
      })
    }

    res.on('end', function () {
      clearTimeout(reqTimeout)
      test._ntf.reqClosed = true
      if (!opts.handle && !test._ntf.reqDone) {
        test._ntf.reqDone = true
        callback(test, req, res)
      }
    })

    if (opts.handle) callback(test, req, res)
  })

  if (!opts.handle) req.end(opts.data)
}

exports.del = function(test, opts, callback) {
  opts.method = 'delete'
  return exports.request(test, opts, callback)
}

exports.get = function(test, opts, callback) {
  opts.method = 'get'
  return exports.request(test, opts, callback)
}

exports.post = function(test, opts, callback) {
  opts.data = opts.data || ''
  opts.method = 'post'
  return exports.request(test, opts, callback)
}

exports.put = function(test, opts, callback) {
  opts.data = opts.data || ''
  opts.method = 'put'
  return exports.request(test, opts, callback)
}
