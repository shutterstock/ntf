var utils = require('../lib/ntf/utils')

exports.SEP = function(test) {
  test.equal(utils.SEP, ' :: ')
  test.done()
}

exports.load = function(test) {
  var data = utils.load(__dirname + '/assets')

  test.strictEqual(typeof(data), 'object')
  test.equal(Object.keys(data).length, 1)

  test.strictEqual(typeof(data.sometest), 'object')
  test.equal(data.sometest.number, 123)
  test.equal(data.sometest.string, 'hello world')

  var ref1 = { myData: 1 }
  var ref2 = utils.load(__dirname + '/assets', ref1)

  test.strictEqual(ref1, ref2)
  test.equal(Object.keys(ref2).length, 2)
  test.strictEqual(typeof(ref2.myData), 'number')
  test.strictEqual(typeof(ref2.sometest), 'object')

  test.done()
}
