var http = require('http')
  , https = require('https')
  , url = require('url')
  , utils = require('./utils')

var exports = module.exports = function(opts) {
  if (typeof(opts) === 'string') opts = { uri: opts }
  if (typeof(opts.uri) === 'function') opts.uri = opts.uri()
  return {
    del: testType(opts, 'del'),
    get: testType(opts, 'get'),
    post: testType(opts, 'post'),
    put: testType(opts, 'put'),
  }
}

var asserts = exports.asserts = {
  statusCode: function(statusCode) {
    this.equal(typeof(this._ntf) === 'object' ? this._ntf.statusCode : undefined,
      statusCode, 'Status code is ' + statusCode)
  },
  header: function(name, match) {
    var result = typeof(this._ntf) === 'object' &&
      typeof(this._ntf.headers) === 'object' &&
      typeof(name) === 'string' &&
      (name = name.toLowerCase()) &&
      this._ntf.headers.hasOwnProperty(name)
    if (result) {
      var values = this._ntf.headers[name]
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
    this.ok(typeof(this._ntf) === 'object' &&
      typeof(this._ntf.data) === 'string' &&
      (match instanceof RegExp ? this._ntf.data.match(match) : this._ntf.data.indexOf(match) >= 0),
      'Content matches "' + match + '"')
  },
  json: function(data) {
    var json = undefined
    try {
      json = JSON.parse(this._ntf.data)
    } catch(err) {}
    this.ok(json !== undefined, 'Content is JSON')
    if (data !== undefined) {
      this.deepEqual(json, data)
    }
    return json
  },
}

var testType = function(parentOpts, type) {
  return function(opts, callback) {
    if (typeof(opts) !== 'object') opts = { uri: opts }

    // add test to module
    return function(test) {
      test.parentOpts = parentOpts
      exports[type].apply(this, [test, opts, callback])
    }
  }
}

var subTestType = function(test, type) {
  return function() {
    var args = Array.prototype.slice.call(arguments)
    args.unshift(test)
    exports[type].apply(this, args)
  }
}

exports.request = function(test, opts, callback) {
  // url can be a function
  if (typeof(opts.uri) === 'function') opts.uri = opts.uri()
  // combine base url and test url
  var uri = url.parse((test.parentOpts.uri || '') + opts.uri)
  // ensure valid timeout
  if (typeof(opts.timeout) !== 'number') opts.timeout = 5000

  for (var a in asserts) {
    if (!test.hasOwnProperty(a)) test[a] = asserts[a]
  }

  // add subtests
  if (!test.del) test.del = subTestType(test, 'del')
  if (!test.get) test.get = subTestType(test, 'get')
  if (!test.post) test.post = subTestType(test, 'post')
  if (!test.put) test.put = subTestType(test, 'put')

  // build http(s).request parameters using url and options
  var httpOpts = {
    host: opts.host || uri.hostname,
    port: opts.port || uri.port,
    headers: opts.headers || {},
    path: opts.path || (uri.pathname || '') + (uri.search || ''),
    method: opts.method || 'GET',
  }
  if (!httpOpts.port) {
    if (uri.protocol == 'http:') {
      httpOpts.port = 80
    } else if (uri.protocol == 'https:') {
      httpOpts.port = 443
    }
  }
  if (opts.auth || uri.auth) {
    httpOpts.headers.Authorization = 'Basic ' +
      new Buffer(opts.auth || uri.auth).toString('base64')
  }
  if (!opts.reqCallback && typeof(httpOpts.headers['Content-Length']) === 'undefined') {
    httpOpts.headers['Content-Length'] = opts.data ? Buffer.byteLength(opts.data, opts.reqEncoding || 'utf8') : 0
  }

  var req = uri.protocol == 'https:' ? https.request(httpOpts) : http.request(httpOpts)
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
      res.data = ''
      res.setEncoding(opts.resEncoding || 'utf8')
      res.on('data', function (chunk) {
        res.data += chunk
      })
    }

    res.on('end', function () {
      clearTimeout(reqTimeout)
      if (!done) {
        test._ntf = res
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
  opts.method = 'DELETE'
  return exports.request(test, opts, callback)
}

exports.get = function(test, opts, callback) {
  opts.method = 'GET'
  return exports.request(test, opts, callback)
}

exports.post = function(test, opts, callback) {
  opts.data = opts.data || ''
  opts.method = 'POST'
  return exports.request(test, opts, callback)
}

exports.put = function(test, opts, callback) {
  opts.data = opts.data || ''
  opts.method = 'PUT'
  return exports.request(test, opts, callback)
}
