function Test(test) {
  for (var t in test) {
    if (test.hasOwnProperty(t) && t != 'ntf') {
      this[t] = test[t]
    }
  }

  if (typeof(this._ntf) === 'object') {
    this._ntf.refcount++
  } else {
    this._ntf = test._ntf = {
      refcount: 0,
      done: test.done,
      teardown: [],
      refcount: 1,
    }
    this.done = function() {
      this._ntf.refcount--
      if (this._ntf.refcount <= 0) {
        for (var i in this._ntf.teardown) this._ntf.teardown[i]()
        this._ntf.done()
      }
    }
  }

  this.ntf = {}
}

exports.setupTest = function(test) {
  return new Test(test)
}
