var fs = require('fs')

exports.SEP = ' :: '

exports.export = function(tests, path) {
  var files = fs.readdirSync(path)

  for (var i in files) {
    var f = files[i]

    if (f.match(/\.js$/)) {
      var module = require(path + '/' + f)
      if (tests != module) {
        tests[f.substring(0, f.length-3)] = module
      }
    }
  }
}
