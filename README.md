ntf
===

ntf is a network testing framework written in [Node.js](http://nodejs.org/).

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

## Documentation

### [DNS](#dns)

  * Test: [a](#dns-test-a), [aaaa](#dns-test-aaaa), [cname](#dns-test-cname), [mx](#dns-test-mx), [ns](#dns-test-ns), [ptr](#dns-test-ptr), [srv](#dns-test-srv), [txt](#dns-test-txt)
  * Assert: [address](#dns-assert-address), [name](#dns-assert-name)

### [HTTP](#http)

  * Test: [del](#http-test-del), [get](#http-test-get), [post](#http-test-post), [put](#http-test-put)
  * Assert: [body](#http-assert-body), [cookie](#http-assert-cookie), [header](#http-assert-header), [json](#http-assert-json), [jsonPath](#http-assert-jsonPath), [statusCode](#http-assert-statusCode)

### [Socket](#socket)

  * Test: [tcp](#socket-test-tcp)
  * Assert: [connect](#socket-assert-connect)

<a name="dns" />
## DNS

Test DNS records.

    var ntf = require('ntf')

    dns = ntf.dns()

<a name="dns-test-a" />
### dns.a(name, callback)

Resolve an IPv4 address record.

__Arguments__

* name - A string to resolve.
* callback(test) - A test callback.

__Example__

    exports.a = dns.a('a.dns.ntfjs.org', function(test) {
      test.address('127.0.0.1')
      test.done()
    })

<a name="dns-test-aaaa" />
### dns.aaaa(name, callback)

Resolve an IPv6 address record.

__Arguments__

* name - A string to resolve.
* callback(test) - A test callback.

__Example__

    exports.aaaa = dns.aaaa('aaaa.dns.ntfjs.org', function(test) {
      test.address('::1')
      test.done()
    })

<a name="dns-test-cname" />
### dns.cname(name, callback)

Resolve a canonical name record.

__Arguments__

* name - A string to resolve.
* callback(test) - A test callback.

__Example__

    exports.cname = dns.cname('cname.dns.ntfjs.org', function(test) {
      test.name('a.dns.ntfjs.org')
      test.done()
    })

<a name="dns-test-mx" />
### dns.mx(name, callback)

Resolve a mail exchange record.

__Arguments__

* name - A string to resolve.
* callback(test) - A test callback.

__Example__

    exports.mx = dns.mx('mx.dns.ntfjs.org', function(test) {
      test.name('mx1.dns.ntfjs.org')
      test.done()
    })

<a name="dns-test-ns" />
### dns.ns(name, callback)

Resolve a name server record.

__Arguments__

* name - A string to resolve.
* callback(test) - A test callback.

__Example__

    exports.ns = dns.ns('ns.dns.ntfjs.org', function(test) {
      test.name('ns1.dns.ntfjs.org')
      test.done()
    })

<a name="dns-test-ptr" />
### dns.ptr(name, callback)

Resolve a pointer record.

__Arguments__

* name - A string to resolve.
* callback(test) - A test callback.

__Example__

    exports.ptr = dns.ptr('50.116.49.237', function(test) {
      test.name('hub.sewell.org')
      test.done()
    })

<a name="dns-test-srv" />
### dns.srv(name, callback)

Resolve a service location record.

__Arguments__

* name - A string to resolve.
* callback(test) - A test callback.

__Example__

    exports.srv = dns.srv('_ntfjs', function(test) {
      test.name('srv1.dns.ntfjs.org')
      test.done()
    })

<a name="dns-test-txt" />
### dns.txt(name, callback)

Resolve a text record.

__Arguments__

* name - A string to resolve.
* callback(test) - A test callback.

__Example__

    exports.txt = dns.txt('_ntfjs', function(test) {
      test.done()
    })

## License

This work is licensed under the MIT License (see the LICENSE file).
