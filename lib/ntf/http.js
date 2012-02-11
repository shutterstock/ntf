var http = require('http'),
  https = require('https'),
  shared = require('./shared'),
  urlLib = require('url');

var testType = function (parentOpts, type) {
  return function (opts, callback) {
    if (typeof (opts) !== 'object') { opts = { url: opts }; }
    opts.url = (parentOpts.url || '') + opts.url;

    return function (test) {
      test = shared.setupTest(test);
      test._ntf.parentOpts = parentOpts;
      if (typeof (test._ntf.meta) !== 'object') { test._ntf.meta = this.meta || {}; }
      exports[type].call(this, test, opts, callback);
    };
  };
};

var exports = module.exports = function (opts) {
  if (typeof (opts) === 'string') { opts = { url: opts }; }
  return {
    del: testType(opts, 'del'),
    get: testType(opts, 'get'),
    post: testType(opts, 'post'),
    put: testType(opts, 'put'),
  };
};

var asserts = exports.asserts = {
  statusCode: function (statusCode) {
    var res = this.ntf.res;
    this.equal(typeof (res) === 'object' ? res.statusCode : undefined,
      statusCode, 'Status code is ' + statusCode);
  },
  header: function (name, match) {
    var res = this.ntf.res,
      values,
      result = typeof (res) === 'object' &&
        typeof (res.headers) === 'object',
      i,
      v;
    if (name === undefined) {
      return result ? res.headers : undefined;
    }
    result = result && typeof (name) === 'string';
    if (result) {
      name = name.toLowerCase();
      result = result && res.headers.hasOwnProperty(name);
    }
    if (match === undefined) {
      this.ok(result, 'Header[' + name + '] exists');
      return result ? res.headers[name] : undefined;
    }
    if (result) {
      values = res.headers[name];
      if (!Array.isArray(values)) { values = [values]; }
      for (i in values) {
        v = values[i];
        result = (match instanceof RegExp) ? v.match(match) : v == match;
        if (result) { break; }
      }
    }
    this.ok(result, 'Header[' + name + '] matches "' + match + '"');
    if (Array.isArray(result)) { return result; }
  },
  body: function (match) {
    if (match === undefined) { return this.ntf.data; }
    var data = this.ntf.data,
      result = typeof (data) === 'string' &&
        (match instanceof RegExp ? data.match(match) : data.indexOf(match) >= 0);
    this.ok(result, 'Content matches "' + match + '"');
    if (Array.isArray(result)) { return result; }
  },
  json: function (match) {
    var result,
      data = this.ntf.data;
    try {
      result = JSON.parse(data);
    } catch (err) {}
    this.ok(result !== undefined, 'Content is JSON');
    if (match !== undefined) {
      this.deepEqual(result, match);
    }
    return result;
  },
};

var subTestType = function (test, type) {
  return function () {
    var args = Array.prototype.slice.call(arguments);
    if (typeof (args[0]) !== 'object') { args[0] = { url: args[0] }; }
    args[0].url = (test._ntf.parentOpts.url || '') + args[0].url;
    args.unshift(test);
    exports[type].apply(this, args);
  };
};

exports.request = function (test, opts, callback) {
  // ensure valid timeout
  if (typeof (opts.timeout) !== 'number') { opts.timeout = 5000; }

  var httpOpts,
    i,
    req,
    reqTimeout,
    start,
    url = urlLib.parse(opts.url);

  if (typeof (test._ntf.meta) === 'object' && test._ntf.meta.currentTest) {
    if (typeof (test._ntf.meta.test) !== 'object') { test._ntf.meta.test = {}; }
    test._ntf.meta.test[test._ntf.meta.currentTest] = {
      type: 'http',
      url: opts.url,
      http_method: opts.method,
    };
  }

  for (i in asserts) {
    if (!test.hasOwnProperty(i)) { test[i] = asserts[i]; }
  }

  // add subtests
  if (!test.del) { test.del = subTestType(test, 'del'); }
  if (!test.get) { test.get = subTestType(test, 'get'); }
  if (!test.post) { test.post = subTestType(test, 'post'); }
  if (!test.put) { test.put = subTestType(test, 'put'); }

  // build http(s).request parameters using url and options
  httpOpts = test.ntf.httpOpts = {
    host: url.hostname,
    port: url.port,
    headers: opts.headers || {},
    path: (url.pathname || '') + (url.search || ''),
    method: opts.method.toUpperCase(),
  };
  if (!httpOpts.port) {
    if (url.protocol === 'http:') {
      httpOpts.port = 80;
    } else if (url.protocol === 'https:') {
      httpOpts.port = 443;
    }
  }
  if (opts.auth || url.auth) {
    httpOpts.headers.Authorization = 'Basic ' +
      new Buffer(opts.auth || url.auth).toString('base64');
  }
  if (!opts.handle && typeof (httpOpts.headers['Content-Length']) === 'undefined') {
    httpOpts.headers['Content-Length'] = opts.data ?
        Buffer.byteLength(opts.data, opts.reqEncoding || 'utf8') : 0;
  }

  req = test.ntf.req = url.protocol === 'https:' ?
        https.request(httpOpts) : http.request(httpOpts);

  test.ntf.reqDone = false;
  test.ntf.reqClosed = false;

  test._ntf.teardown.push(function () {
    if (!test.ntf.reqClosed) {
      test.ntf.reqClosed = true;
      req.end();
    }
  });

  // fail test on http errors
  req.on('error', function (err) {
    if (!test.ntf.reqDone) {
      test.ntf.reqDone = true;
      test.ok(false, err);
      test.done();
    }
  });

  // add timeout if not explicitly disabled, if timeout is raised the test
  // will stop and fail immediately
  if (opts.timeout > 0) {
    start = new Date().getTime();

    reqTimeout = setTimeout(function () {
      req.emit('reqTimeout');
    }, opts.timeout);

    req.on('reqTimeout', function () {
      if (!test.ntf.reqDone) {
        test.ntf.reqDone = true;
        test.fail(new Date().getTime() - start, opts.timeout, '', '>=',
          'Request timed out');
        test.done();
      }
    });
  }

  req.on('response', function (res) {
    test.ntf.res = res;

    if (!opts.handle || opts.handleData) {
      test.ntf.data = '';
      res.setEncoding(opts.resEncoding || 'utf8');
      res.on('data', function (chunk) {
        test.ntf.data += chunk;
      });
    }

    res.on('end', function () {
      if (reqTimeout) { clearTimeout(reqTimeout); }
      test.ntf.reqClosed = true;
      if (!opts.handle && !test.ntf.reqDone) {
        test.ntf.reqDone = true;
        callback(test, req, res);
      }
    });

    if (opts.handle) { callback(test, req, res); }
  });

  if (!opts.handle) { req.end(opts.data); }
};

exports.del = function (test, opts, callback) {
  opts.method = 'delete';
  return exports.request(test, opts, callback);
};

exports.get = function (test, opts, callback) {
  opts.method = 'get';
  return exports.request(test, opts, callback);
};

exports.post = function (test, opts, callback) {
  opts.data = opts.data || '';
  opts.method = 'post';
  return exports.request(test, opts, callback);
};

exports.put = function (test, opts, callback) {
  opts.data = opts.data || '';
  opts.method = 'put';
  return exports.request(test, opts, callback);
};
