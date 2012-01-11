ntf
===

ntf is a network testing framework.

### Requirements

  * [node](http://nodejs.org/)
  * [npm](http://npmjs.org/)

### Usage

Install ntf

    npm install ntf

Add node\_modules to path

    export PATH="./node_modules/.bin:$PATH"

Create test file

    cat << EOF > silas.sewell.org.js
    var ntf = require('ntf')
      , test = ntf.http.test(exports, 'http://silas.sewell.org')

    test.get('homepage', '/', function(test, res) {
      test.statusCode(res, 200)
      test.body(res, 'Silas Sewell')
      test.done()
    })
    EOF

Run tests

    ntf silas.sewell.org.js

### License

This work is licensed under the MIT License (see the LICENSE file).
