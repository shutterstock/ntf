ntf
===

ntf is a network testing framework written in [Node.js](http://nodejs.org/).

[![Build Status](https://secure.travis-ci.org/silas/ntf.png)](http://travis-ci.org/silas/ntf)

## Getting Started

Install ntf

    npm install ntf
    npm install ntf -g

Create a file named `ntfjs.org.js`

    var ntf = require('ntf')
      , test = ntf.http('http://ntfjs.org')

    exports.homepage = test.get('/', function(test) {
      test.statusCode(200)
      test.body('ntf')
      test.done()
    })

Run the tests

    ntf ntfjs.org.js

<a name="documentation" />
## Documentation

### [DNS](#dns)

  * Test: [a](#dns-test-a), [aaaa](#dns-test-aaaa), [cname](#dns-test-cname), [mx](#dns-test-mx), [ns](#dns-test-ns), [ptr](#dns-test-ptr), [srv](#dns-test-srv), [txt](#dns-test-txt)
  * Assert: [address](#dns-assert-address), [name](#dns-assert-name)

### [HTTP](#http)

  * Test: [request](#http-test-request), [del](#http-test-del), [get](#http-test-get), [post](#http-test-post), [put](#http-test-put)
  * Assert: [body](#http-assert-body), [cookie](#http-assert-cookie), [header](#http-assert-header), [json](#http-assert-json), [jsonPath](#http-assert-json-path), [statusCode](#http-assert-status-code)

### [Socket](#socket)

  * Test: [tcp](#socket-test-tcp)
  * Assert: [connect](#socket-assert-connect)

<a name="dns" />
## DNS

Test DNS records.

    var ntf = require('ntf')
      , dns = ntf.dns()

<a name="dns-test-a" />
### dns.a(name, callback)

Resolve an IPv4 address record.

__Arguments__

* name {String} - name to resolve
* callback(test) {Function} - test callback

__Example__

    exports.a = dns.a('a.dns.ntfjs.org', function(test) {
      test.address('127.0.0.1')
      test.done()
    })

<a name="dns-test-aaaa" />
### dns.aaaa(name, callback)

Resolve an IPv6 address record.

__Arguments__

* name {String} - name to resolve
* callback(test) {Function} - test callback

__Example__

    exports.aaaa = dns.aaaa('aaaa.dns.ntfjs.org', function(test) {
      test.address('::1')
      test.done()
    })

<a name="dns-test-cname" />
### dns.cname(name, callback)

Resolve a canonical name record.

__Arguments__

* name {String} - canonical name to resolve
* callback(test) {Function} - test callback

__Example__

    exports.cname = dns.cname('cname.dns.ntfjs.org', function(test) {
      test.name('a.dns.ntfjs.org')
      test.done()
    })

<a name="dns-test-mx" />
### dns.mx(name, callback)

Resolve a mail exchange record.

__Arguments__

* name {String} - mail exchange to resolve
* callback(test) {Function} - test callback

__Example__

    exports.mx = dns.mx('mx.dns.ntfjs.org', function(test) {
      test.name('mx1.dns.ntfjs.org')
      test.done()
    })

<a name="dns-test-ns" />
### dns.ns(name, callback)

Resolve a name server record.

__Arguments__

* name {String} - name server to resolve
* callback(test) {Function} - test callback

__Example__

    exports.ns = dns.ns('ns.dns.ntfjs.org', function(test) {
      test.name('ns1.dns.ntfjs.org')
      test.done()
    })

<a name="dns-test-ptr" />
### dns.ptr(ip, callback)

Resolve a pointer record.

__Arguments__

* name {String} - IP address to resolve
* callback(test) {Function} - test callback

__Example__

    exports.ptr = dns.ptr('50.116.49.237', function(test) {
      test.name('hub.sewell.org')
      test.done()
    })

<a name="dns-test-srv" />
### dns.srv(name, callback)

Resolve a service location record.

__Arguments__

* name {String} - service to resolve
* callback(test) {Function} - test callback

__Example__

    exports.srv = dns.srv('_ntfjs', function(test) {
      test.name('srv1.dns.ntfjs.org')
      test.done()
    })

<a name="dns-test-txt" />
### dns.txt(name, callback)

Resolve a text record.

__Arguments__

* name {String} - text to resolve
* callback(test) {Function} - test callback

__Example__

    exports.txt = dns.txt('_ntfjs', function(test) {
      test.done()
    })

<a name="dns-assert-address" />
### test.address(ip)

Assert answer contains IP address.

__Arguments__

* ip {String} - IP address to check

__Example__

    exports.a = dns.a('a.dns.ntfjs.org', function(test) {
      test.address('127.0.0.1')
      test.done()
    })

<a name="dns-assert-name" />
### test.name(name)

Assert answer contains name.

__Arguments__

* name {String} - name to check

__Example__

    exports.cname = dns.cname('cname.dns.ntfjs.org', function(test) {
      test.name('a.dns.ntfjs.org')
      test.done()
    })

<a name="http" />
## HTTP

Test HTTP requests.

    var ntf = require('ntf')
      , http = ntf.http('http://http.ntfjs.org')

<a name="http-test-request" />
### http.request(options, callback)

Execute an HTTP request.

<a name="http-test-request-arguments" />
__Arguments__

* options {Object,String} - options or path/URL
  * auth {String} - username and password (ex: "user:pass")
  * body {Object,String} - request body
  * cookie {Object} - cookie names and values (ex: { "sid": "2bf74f" })
  * header {Object} - header names and values (ex: { "content-type": "application/json" })
  * jar {Boolean} - persist cookies in sub-requests
  * method {String} - HTTP method (delete, get, post, put)
  * timeout {Integer} - maximum number of milliseconds request can take before its killed
  * type {String} - encodes body and sets content-type header (form, json)
  * url {String} - path or URL
* callback(test) {Function} - test callback

__Example__

    exports.request = http.request('/', function(test) {
      test.statusCode(200)
      test.done()
    })

<a name="http-test-del" />
### http.del(options, callback)

Execute an HTTP delete request.

__Arguments__

* options {Object,String} - see [request arguments](#http-test-request-arguments)
  * method {String} - always set to delete
* callback(test) {Function} - test callback

__Example__

    exports.del = http.del('/delete', function(test) {
      test.statusCode(200)
      test.done()
    })

<a name="http-test-get" />
### http.get(options, callback)

Execute an HTTP get request.

__Arguments__

* options {Object,String} - see [request arguments](#http-test-request-arguments)
  * method {String} - always set to get
* callback(test) {Function} - test callback

__Example__

    exports.get = http.get('/get', function(test) {
      test.statusCode(200)
      test.done()
    })

<a name="http-test-post" />
### http.post(options, callback)

Execute an HTTP post request.

__Arguments__

* options {Object} - see [request arguments](#http-test-request-arguments)
  * body {Object,String} - should be object by default (see type below)
  * method {String} - always set to post
  * type {String} - defaults to form
* callback(test) {Function} - test callback

__Example__

    exports.post = http.post({ url: '/post', body: { 'q': 'test' } }), function(test) {
      test.statusCode(201)
      test.done()
    })

<a name="http-test-put" />
### http.put(options, callback)

Execute an HTTP put request.

__Arguments__

* options {Object} - see [request arguments](#http-test-request-arguments)
  * method {String} - always set to put
* callback(test) {Function} - test callback

__Example__

    exports.put = http.put({ url: '/put', body: 'put' }), function(test) {
      test.statusCode(201)
      test.done()
    })

<a name="http-assert-body" />
### test.body([match[, compare...]])

Tests `match` against body and returns result.

__Arguments__

* match
   * RegExp - asserts body matches RegExp
      * compare {String} - compare against match results
      * return {Array,null} - RegExp match result
   * String - asserts body contains match
      * return {Integer} - first position of matched result
   * undefined
      * return {String,undefined} - body String

__Example__

    exports.get = http.get('/', function(test) {
      test.body(/<title>(.*)<\/title>/, 'ntf')
      test.done()
    })

<a name="http-assert-cookie" />
### test.cookie([name[, match]])

Tests cookie existence/value and returns match.

__Arguments__

* name {String} - cookie name
* match
   * RegExp - asserts value matches RegExp
      * return {Array,null} - RegExp match result
   * String - asserts value matches String
   * undefined
      * return {Object,undefined} - cookie object

__Example__

    exports.get = http.get('/', function(test) {
      test.cookie('sid', /^[a-f0-9]+$/)
      test.done()
    })

<a name="http-assert-header" />
### test.header([name[, match]])

Tests header existence/value and returns match.

__Arguments__

* name {String} - header name
* match
   * RegExp - asserts value matches RegExp
      * return {Array,null} - RegExp match result
   * String - asserts value matches String
   * undefined
      * return {Object,undefined} - header object

__Example__

    exports.get = http.get('/', function(test) {
      test.header('Content-Type', 'text/html')
      test.done()
    })

<a name="http-assert-json" />
### test.json([match])

Tests body against match and returns parsed JSON.

__Arguments__

* match - deep equal assert against match
* return - parsed JSON object

__Example__

    exports.get = http.get('/', function(test) {
      test.json({ one: 'two' })
      test.done()
    })

<a name="http-assert-json-path" />
### test.jsonPath([path[, compare...]])

Tests json path against compares and returns result.

__Arguments__

* path {String} - json path ([examples](https://github.com/s3u/JSONPath#readme))
* compare - compare against json path results
* return {Array} - parsed JSON object

__Example__

    exports.get = http.get('/', function(test) {
      test.jsonPath('$.book.title', 'Second Foundation', "The Wise Man's Fear")
      test.done()
    })

<a name="http-assert-status-code" />
### test.statusCode(code)

Tests response status code.

__Arguments__

* code {Integer} - status code

__Example__

    exports.get = http.get('/', function(test) {
      test.statusCode(200)
      test.done()
    })

<a name="socket" />
## Socket

Test socket connections.

    var ntf = require('ntf')
      , socket = ntf.socket('ntfjs.org')

<a name="socket-test-tcp" />
### socket.tcp(port, callback)

Open TCP connection to host and port.

__Arguments__

* options {Integer,Object} - port or options
  * port {Integer} - port
  * timeout {Integer} - maximum number of milliseconds before connection is killed
* callback(test) {Function} - test callback

__Example__

    exports.tcp = socket.tcp(25, function(test) {
      test.connect()
      test.done()
    })

<a name="socket-assert-connect" />
### test.connect(code)

Tests connection was opened.

__Example__

    exports.tcp = socket.tcp(25, function(test) {
      test.connect()
      test.done()
    })

## License

This work is licensed under the MIT License (see the LICENSE file).
