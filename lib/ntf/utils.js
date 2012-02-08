var fs = require('fs')

exports.load = function(path, tests) {
  var fileList = fs.readdirSync(path)

  if (typeof(tests) !== 'object') {
    tests = {}
  }

  fileList.forEach(function(file) {
    if (file.match(/\.js$/)) {
      tests[file.substring(0, file.length-3)] = path + '/' + file
    }
  })

  return tests
}
