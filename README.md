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

Resolve a DNS address record.

__Arguments__

* name - A string to resolve.
* callback(test) - A test callback.

__Example__

    dns.a('example.org', function(test) {
      test.address('207.97.227.245')
      test.done()
    })

## License

This work is licensed under the MIT License (see the LICENSE file).
