exports.setupTest = function(test) {
  var first = typeof(test._ntf) !== 'object'

  if (first) test._ntf = { refcount: 0, done: test.done, teardown: [] }

  test._ntf.meta = typeof(test.meta) === 'object' ? test.meta : {}
  test._ntf.refcount++

  if (!first) return

  test.done = function() {
    test._ntf.refcount--
    if (test._ntf.refcount <= 0) {
      for (var i in test._ntf.teardown) test._ntf.teardown[i]()
      test._ntf.done()
    }
  }
}
