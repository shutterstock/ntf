ntf
===

ntf is a network testing framework written in [Node.js](http://nodejs.org/).

### Getting Started

Install ntf

    npm install -g ntf

Create a file named `silas.sewell.org.js`

    var ntf = require('ntf')
      , test = ntf.http('http://silas.sewell.org')

    exports.homepage = test.get('/', function(test) {
      test.statusCode(200)
      test.body('Silas Sewell')
      test.done()
    })

Run the tests

    ntf silas.sewell.org.js

### License

This work is licensed under the MIT License (see the LICENSE file).
