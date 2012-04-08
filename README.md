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

* [DNS](#dns)
   * [a](#dns-a)
   * [aaaa](#dns-aaaa)
   * [cname](#dns-cname)
   * [mx](#dns-mx)
   * [ns](#dns-ns)
   * [ptr](#dns-ptr)
   * [srv](#dns-srv)
   * [txt](#dns-txt)
   * Assert
      * [address](#dns-assert-address)
      * [name](#dns-assert-name)
* [HTTP](#http)
   * [del](#http-del)
   * [get](#http-get)
   * [post](#http-post)
   * [put](#http-put)
   * Assert
      * [statusCode](#http-assert-statusCode)
      * [header](#http-assert-header)
      * [body](#http-assert-body)
      * [cookie](#http-assert-cookie)
      * [json](#http-assert-json)
      * [jsonPath](#http-assert-jsonPath)
* [Socket](#socket)
   * [tcp](#socket-tcp)
   * Assert
      * [connect](#socket-assert-connect)

## License

This work is licensed under the MIT License (see the LICENSE file).
