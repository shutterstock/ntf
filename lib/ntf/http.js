var http = require('http')
  , https = require('https')
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
      typeof(res.headers) === 'object' &&
      typeof(name) === 'string' &&
      (name = name.toLowerCase()) &&
      res.headers.hasOwnProperty(name)
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
    return result || null
  },
  body: function(match) {
    var data = this._ntf.data
    this.ok(typeof(data) === 'string' &&
      (match instanceof RegExp ? data.match(match) : data.indexOf(match) >= 0),
      'Content matches "' + match + '"')
  },
  json: function(match) {
    var json = undefined
      , data = this._ntf.data
    try {
      json = JSON.parse(data)
    } catch(err) {}
    this.ok(json !== undefined, 'Content is JSON')
    if (match !== undefined) {
      this.deepEqual(json, match)
    }
    return json
  },
}

var testType = function(parentOpts, type) {
  return function(opts, callback) {
    if (typeof(opts) !== 'object') opts = { url: opts }
    opts.url = (parentOpts.url || '') + opts.url

    return function(test) {
      test._ntf = { meta: (typeof(this.meta) === 'object' ? this.meta : {}) }
      exports[type].call(this, test, opts, callback)
    }
  }
}

exports.request = function(test, opts, callback) {
  // ensure valid timeout
  if (typeof(opts.timeout) !== 'number') opts.timeout = 5000

  var url = urlLib.parse(opts.url)

  if (test._ntf.meta.currentTest) {
    if (typeof(test._ntf.meta.test) !== 'object') test._ntf.meta.test = {}
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
  var httpOpts = {
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
  if (!opts.reqCallback && typeof(httpOpts.headers['Content-Length']) === 'undefined') {
    httpOpts.headers['Content-Length'] = opts.data ?
      Buffer.byteLength(opts.data, opts.reqEncoding || 'utf8') : 0
  }

  var req = url.protocol == 'https:' ? https.request(httpOpts) : http.request(httpOpts)
    , done = false

  req.on('error', function (err) {
    if (!done) {
      done = true
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
      if (!done) {
        done = true
        test.fail(new Date().getTime() - start, opts.timeout, '', '>=', 'Request timed out')
        test.done()
      }
    })
  }

  req.on('response', function (res) {
    res.options = httpOpts

    // user can handle response
    if (opts.resCallback) {
      opts.resCallback(res)
    } else {
      test._ntf.data = ''
      res.setEncoding(opts.resEncoding || 'utf8')
      res.on('data', function (chunk) {
        test._ntf.data += chunk
      })
    }

    res.on('end', function () {
      clearTimeout(reqTimeout)
      if (!done) {
        test._ntf.res = res
        callback(test, res)
      }
    })
  })

  // user can handle sending data and ending request
  if (opts.reqCallback) {
    opts.reqCallback(req)
  } else {
    req.end(opts.data)
  }
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
