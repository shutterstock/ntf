var http = require('http')
  , https = require('https')
  , jsonpath = require('../vendor/jsonpath')
  , shared = require('./shared')
  , qs = require('querystring')
  , urlLib = require('url')

var testType = function(parentOpts, type) {
  return function(opts, callback) {
    if (typeof(opts) !== 'object') opts = { url: opts }
    opts.url = (parentOpts.url || '') + opts.url

    return function(test) {
      test = shared.setupTest(test)
      test._ntf.parentOpts = parentOpts
      if (typeof(test._ntf.meta) !== 'object') test._ntf.meta = this.meta || {}
      TEST[type].call(this, test, opts, callback)
    }
  }
}

var TEST = module.exports = function(opts) {
  if (typeof(opts) === 'string') opts = { url: opts }
  return {
    request: testType(opts, 'request'),
    del: testType(opts, 'del'),
    get: testType(opts, 'get'),
    head: testType(opts, 'head'),
    options: testType(opts, 'options'),
    patch: testType(opts, 'patch'),
    post: testType(opts, 'post'),
    put: testType(opts, 'put')
  }
}

var asserts = TEST.asserts = {
  statusCode: function(code) {
    var res = this.ntf.res
    this.equal(typeof(res) === 'object' ? res.statusCode : undefined,
      code, 'Status code is ' + code)
  },
  header: function(name, match) {
    var res = this.ntf.res
      , values
      , result = typeof(res) === 'object' && typeof(res.headers) === 'object'
    if (name === undefined)
      return result ? res.headers : undefined
    result = result && typeof(name) === 'string'
    if (result) {
      name = name.toLowerCase()
      result = result && res.headers.hasOwnProperty(name)
    }
    if (match === undefined) {
      this.ok(result, 'Header[' + name + '] exists')
      return result ? res.headers[name] : undefined
    }
    if (result) {
      values = res.headers[name]
      if (!Array.isArray(values)) values = [values]
      for (var i in values) {
        v = values[i]
        result = (match instanceof RegExp) ? v.match(match) : v == match
        if (result) break
      }
    }
    this.ok(result, 'Header[' + name + '] matches "' + match + '"')
    if (Array.isArray(result)) return result
  },
  body: function(match) {
    if (match === undefined) return this.ntf.body
    var self = this
      , body = typeof(self.ntf.body) === 'string' ? self.ntf.body : ''
      , check = function(result) { self.ok(result, 'Content matches "' + match + '"') }
      , args = Array.prototype.slice.call(arguments, 1)
      , result
    if (typeof(match) === 'string') {
      result = typeof(body) === 'string' ? body.indexOf(match) : -1
      check(body.indexOf(match) >= 0)
    } else if (match instanceof RegExp) {
      result = typeof(body) === 'string' ? body.match(match) : null
      check(result)
      args.forEach(function(value, i) {
        self.equal(result && result[i+1], value,
          'Body[' + i + ']' +
          (!result || result[i+1] === undefined ? '' : result[i+1]) +
          ' !== ' + JSON.stringify(value))
      })
    }
    return result
  },
  cookie: function(name, match) {
    if (!this.ntf.hasOwnProperty('cookie')) {
      var header = this.header()
        , setCookie = header && header.hasOwnProperty('set-cookie') ? header['set-cookie'] : []
        , cookie = {}
      if (!Array.isArray(setCookie)) setCookie = [setCookie]
      setCookie.forEach(function(parts) {
        var key = null
        parts.split(';').forEach(function(t, i) {
          t = t.trim().split('=')
          var n = t[0].toLowerCase()
            , v = t.slice(1).join('=')
          if (i === 0) {
            key = n
            cookie[key] = { value: v }
            return
          }
          try {
            switch (n) {
              case 'httponly':
              case 'secure':
                cookie[key][n] = true
                break
              case 'max-age':
                v = parseInt(v, 10)
                break
              case 'expires':
                cookie[key][n] = new Date(v)
                break
              // case 'domain':
              // case 'path':
              default:
                cookie[key][n] = v
                break
            }
          } catch(err) {
            // ignore errors
          }
        })
      })
      this.ntf.cookie = cookie
    }
    if (name !== undefined) {
      var exists = this.ntf.cookie.hasOwnProperty(name)
      if (match === undefined) {
        this.ok(exists, 'Cookie[' + name + '] exists')
      } else {
        var v = exists && this.ntf.cookie[name]
          , r = false
        if (v && v.hasOwnProperty('value') && typeof(v.value) === 'string') {
          r = (match instanceof RegExp) ? v.value.match(match) : v.value == match
        }
        this.ok(r, 'Cookie[' + name + '] matches "' + match + '"')
        if (match instanceof RegExp) return r
      }
      return this.ntf.cookie[name]
    }
    return this.ntf.cookie
  },
  json: function(match) {
    if (!this.ntf.hasOwnProperty('json')) {
      try {
        this.ntf.json = JSON.parse(this.ntf.body)
      } catch (err) {
        this.ntf.json = undefined
      }
      this.ok(this.ntf.json !== undefined, 'Content is JSON')
    }
    if (match !== undefined) this.deepEqual(this.ntf.json, match)
    return this.ntf.json
  },
  jsonPath: function(path) {
    var result = jsonpath(this.json(), path)
    if (!Array.isArray(result)) result = []
    for (var i = 1; i < arguments.length; i++) {
      this.deepEqual(result[i-1], arguments[i],
        'JSONPath[' + (i-1) + ']' +
        (result[i-1] === undefined ? '' : result[i-1]) +
        ' !== ' + JSON.stringify(arguments[i]))
    }
    return result
  }
}

var subTestType = function(test, type) {
  return function() {
    var args = Array.prototype.slice.call(arguments)
    if (typeof(args[0]) !== 'object') args[0] = { url: args[0] }
    var opts = args[0]
    opts.url = (test._ntf.parentOpts.url || '') + opts.url
    if (!opts.hasOwnProperty('jar') && test.ntf.hasOwnProperty('jar')) {
      opts.jar = test.ntf.jar
    }
    if (opts.jar) {
      var cookie = test.cookie()
      if (cookie && Object.keys(cookie).length) {
        Object.keys(cookie).forEach(function(name) {
          opts.jar[name] = cookie[name]
        })
      }
    }
    test.ntf = {}
    args.unshift(test)
    TEST[type].apply(this, args)
  }
}

var request = function(test, opts, callback) {
  // ensure valid timeout
  if (typeof(opts.timeout) !== 'number') opts.timeout = 30 * 1000
  if (typeof(opts.jar) && typeof(opts.jar)!== 'object') opts.jar = {}

  var reqTimeout
    , url = urlLib.parse(opts.url)

  if (typeof(test._ntf.meta) === 'object' && test._ntf.meta.currentTest) {
    if (typeof(test._ntf.meta.test) !== 'object') { test._ntf.meta.test = {} }
    test._ntf.meta.test[test._ntf.meta.currentTest] = {
      type: 'http',
      url: opts.url,
      http_method: opts.method
    }
  }

  for (var i in asserts) {
    if (!test.hasOwnProperty(i)) test[i] = asserts[i]
  }

  // add subtests
  if (!test.del) test.del = subTestType(test, 'del')
  if (!test.get) test.get = subTestType(test, 'get')
  if (!test.head) test.head = subTestType(test, 'head')
  if (!test.options) test.options = subTestType(test, 'options')
  if (!test.patch) test.patch = subTestType(test, 'patch')
  if (!test.post) test.post = subTestType(test, 'post')
  if (!test.put) test.put = subTestType(test, 'put')

  // normalize header keys to lowercase
  var header = {}
  if (typeof(opts.header) === 'object') {
    Object.keys(opts.header).forEach(function(key) {
      header[key.toLowerCase()] = opts.header[key]
    })
  }

  // build http(s).request parameters using url and options
  var httpOpts = test.ntf.httpOpts = {
    host: url.hostname,
    port: url.port,
    headers: header,
    path: (url.pathname || '') + (url.search || ''),
    method: opts.method.toUpperCase()
  }
  if (!httpOpts.port) {
    if (url.protocol === 'http:') {
      httpOpts.port = 80
    } else if (url.protocol === 'https:') {
      httpOpts.port = 443
    }
  }
  if ((opts.auth || url.auth) && !httpOpts.headers.authorization) {
    httpOpts.headers.authorization = 'Basic ' +
      new Buffer(opts.auth || url.auth).toString('base64')
  }
  var handleCookie = function(cookies) {
    if (typeof(cookies) !== 'object') return
    Object.keys(cookies).forEach(function(name) {
      var cookieStr = httpOpts.headers.cookie ? httpOpts.headers.cookie + '; ' : ''
        , cookie = cookies[name]
      httpOpts.headers.cookie = cookieStr + name + '=' +
        (typeof(cookie) === 'object' ? cookie.value : cookie)
    })
  }
  if (opts.jar) {
    handleCookie(opts.jar)
    test.ntf.jar = opts.jar
  }
  handleCookie(opts.cookie)
  if (!opts.handle) {
    var setContentType = function(type) {
      if (!httpOpts.headers.hasOwnProperty('content-type')) {
        httpOpts.headers['content-type'] = type
      }
    }
    switch (opts.type) {
      case null:
        break
      case 'form':
        opts.body = qs.stringify(opts.body).toString('utf8')
        setContentType('application/x-www-form-urlencoded')
        break
      case 'json':
        opts.body = JSON.stringify(opts.body)
        setContentType('application/json')
        break
    }
    if (!httpOpts.headers.hasOwnProperty('content-length')) {
      httpOpts.headers['content-length'] = opts.body ?
        Buffer.byteLength(opts.body, opts.reqEncoding || 'utf8') : 0
    }
  }

  var req = test.ntf.req = url.protocol === 'https:' ?
            https.request(httpOpts) : http.request(httpOpts)

  test.ntf.reqDone = false
  test.ntf.reqClosed = false

  test._ntf.teardown.push(function() {
    if (!test.ntf.reqClosed) {
      test.ntf.reqClosed = true
      req.end()
    }
  })

  // fail test on http errors
  req.on('error', function(err) {
    if (!test.ntf.reqDone) {
      test.ntf.reqDone = true
      test.ok(false, err)
      test.done()
    }
  })

  // add timeout if not explicitly disabled, if timeout is raised the test
  // will stop and fail immediately
  if (opts.timeout > 0) {
    var start = new Date().getTime()

    reqTimeout = setTimeout(function() {
      req.emit('reqTimeout')
    }, opts.timeout)

    req.on('reqTimeout', function() {
      if (!test.ntf.reqDone) {
        test.ntf.reqDone = true
        test.fail(new Date().getTime() - start, opts.timeout, '', '>=',
          'Request timed out')
        test.done()
      }
    })
  }

  req.on('response', function(res) {
    test.ntf.res = res

    if (test.ntf.jar) {
      var cookie = test.cookie()
      Object.keys(cookie).forEach(function(name) {
        test.ntf.jar[name] = cookie[name]
      })
    }

    if (!opts.handle || opts.handleData) {
      test.ntf.body = ''
      res.setEncoding(opts.resEncoding || 'utf8')
      res.on('data', function(chunk) {
        test.ntf.body += chunk
      })
    }

    res.on('end', function() {
      if (reqTimeout) clearTimeout(reqTimeout)
      test.ntf.reqClosed = true
      if (!opts.handle && !test.ntf.reqDone) {
        test.ntf.reqDone = true
        callback(test, req, res)
      }
    })

    if (opts.handle) callback(test, req, res)
  })

  if (!opts.handle) req.end(opts.body)
}

TEST.request = function(test, opts, callback) {
  opts.method = opts.method || 'get'
  return request(test, opts, callback)
}

TEST.del = function(test, opts, callback) {
  opts.method = 'delete'
  return request(test, opts, callback)
}

TEST.get = function(test, opts, callback) {
  opts.method = 'get'
  return request(test, opts, callback)
}

TEST.head = function(test, opts, callback) {
  opts.method = 'head'
  return request(test, opts, callback)
}

TEST.options = function(test, opts, callback) {
  opts.method = 'options'
  return request(test, opts, callback)
}

TEST.patch = function(test, opts, callback) {
  opts.method = 'patch'
  opts.body = opts.hasOwnProperty('body') ? opts.body : ''
  return request(test, opts, callback)
}

TEST.post = function(test, opts, callback) {
  opts.body = opts.body || {}
  opts.type = opts.hasOwnProperty('type') ? opts.type : 'form'
  opts.method = 'post'
  return request(test, opts, callback)
}

TEST.put = function(test, opts, callback) {
  opts.body = opts.hasOwnProperty('body') ? opts.body : ''
  opts.method = 'put'
  return request(test, opts, callback)
}
