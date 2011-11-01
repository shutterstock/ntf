ntf
===

ntf is a network testing framework.

### Requirements

  * [node](http://nodejs.org/)
  * [npm](http://npmjs.org/)

### Usage

    # install library
    npm install ntf

    # add node_modules bin to path
    export PATH="./node_modules/.bin:$PATH"

    # create test file
    cat << EOF > silas.sewell.org.js
    var ntf = require('ntf')
      , test = ntf.http.test(exports, 'http://silas.sewell.org')

    test.get('homepage', '/', function(test, res) {
      test.statusCode(res, 200)
      test.hasContent(res, 'Silas Sewell')
      test.done()
    })
    EOF

    # run tests
    ntf silas.sewell.org.js

### License

This work is licensed under the MIT License (see the LICENSE file).
