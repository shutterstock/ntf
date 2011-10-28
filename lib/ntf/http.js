var http = require('http')
  , https = require('https')
  , uri = require('url')

var asserts = {
  statusCode: function(res, code) {
    this.equals(res.statusCode, code, 'Status code is ' + code)
  },
  hasContent: function(res, text) {
    this.ok(res.data.indexOf(text) >= 0, 'Content contains "' + text + '"')
  },
  json: function(res) {
    var json = null
    try {
      json = JSON.parse(res.data)
    } catch(err) {}
    this.ok(json, 'Content is JSON')
    return json
  },
}

var testType = function(e, url, type) {
  return function() {
    var args = Array.prototype.slice.call(arguments)

    // url can be a function
    if (typeof(args[1]) === 'function') args[1] = args[1]()

    // add test to module
    e[url + args[1] + ' :: ' + args[0]] = function(test) {
      args.shift()
      test.url = url
      args.unshift(test)
      exports[type].apply(this, args)
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

exports.test = function(e, url) {
  // url can be a function
  if (typeof(url) === 'function') url = url()

  return {
    del: testType(e, url, 'del'),
    get: testType(e, url, 'get'),
    post: testType(e, url, 'post'),
    put: testType(e, url, 'put'),
  }
}

exports.request = function(test, url, opts, callback) {
  // url can be a function
  if (typeof(url) === 'function') url = url()
  // combine base url and test url
  url = uri.parse((test.url || '') + url)

  opts = opts || {}
  if (typeof(opts.timeout) === 'undefined') opts.timeout = 5000

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
    host: opts.host || url.hostname,
    port: opts.port || url.port,
    headers: opts.headers || {},
    path: opts.path || (url.pathname || '') + (url.search || ''),
    method: opts.method || 'GET',
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

  var req = url.protocol == 'https:' ? https.request(httpOpts) : http.request(httpOpts)
    , timedOut = false

  // add timeout if not explicitly disabled, if timeout is raised the test
  // will stop and fail immediately
  if (opts.timeout > 0) {
    var start = new Date().getTime()

    var reqTimeout = setTimeout(function() {
      req.emit('reqTimeout')
    }, opts.timeout)

    req.on('reqTimeout', function() {
      timedOut = true
      test.fail(new Date().getTime() - start, opts.timeout, '', '>=', 'Request timed out')
      test.done()
    })
  }

  req.on('response', function (res) {
    res.options = httpOpts

    // user can handle response
    if (opts.resCallback) {
      opts.resCallback(res)
    } else {
      res.data = ''
      res.setEncoding('utf8')
      res.on('data', function (chunk) {
        res.data += chunk
      })
    }

    res.on('end', function () {
      clearTimeout(reqTimeout)
      if (!timedOut) callback(test, res)
    })
  })

  req.on('error', function (res) {
    // TODO: handle error
  })

  // user can handle sending data and ending request
  if (opts.reqCallback) {
    opts.reqCallback(req)
  } else {
    req.end(opts.data)
  }
}

exports.del = function(/* test, url, [opts], callback */) {
  var test = arguments[0]
    , url = arguments[1]
    , opts = {}
    , callback = null

  if (arguments.length == 4) {
    opts = arguments[2]
    callback = arguments[3]
  } else {
    callback = arguments[2]
  }

  opts.method = 'DELETE'
  return exports.request(test, url, opts, callback)
}

exports.get = function(/* test, url, [opts], callback */) {
    var test = arguments[0]
    , url = arguments[1]
    , opts = {}
    , callback = null

  if (arguments.length == 4) {
    opts = arguments[2]
    callback = arguments[3]
  } else {
    callback = arguments[2]
  }

  opts.method = 'GET'
  return exports.request(test, url, opts, callback)
}

exports.post = function(/* test, url, data, [opts], callback */) {
    var test = arguments[0]
    , url = arguments[1]
    , opts = {}
    , callback = null

  if (arguments.length == 5) {
    opts = arguments[3]
    callback = arguments[6]
  } else {
    callback = arguments[3]
  }

  opts.data = arguments[2]
  opts.method = 'POST'
  return exports.request(test, url, opts, callback)
}

exports.put = function(/* test, url, data, [opts], callback */) {
  var test = arguments[0]
    , url = arguments[1]
    , opts = {}
    , callback = null

  if (arguments.length == 5) {
    opts = arguments[3]
    callback = arguments[4]
  } else {
    callback = arguments[3]
  }

  opts.data = arguments[2]
  opts.method = 'PUT'
  return exports.request(test, url, opts, callback)
}
