ntf
===

ntf is a network testing framework written in [node.js](http://nodejs.org/).

### Usage

Install ntf

    npm install ntf

Add node\_modules to path

    export PATH="./node_modules/.bin:$PATH"

Create file `silas.sewell.org.js`

    var ntf = require('ntf')
      , test = ntf.http('http://silas.sewell.org')

    exports.homepage = test.get('/', function(test, res) {
      test.statusCode(200)
      test.body('Silas Sewell')
      test.done()
    })

Run tests

    ntf silas.sewell.org.js

### License

This work is licensed under the MIT License (see the LICENSE file).
