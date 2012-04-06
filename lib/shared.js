function Test(test) {
  for (var i in test) {
    if (test.hasOwnProperty(i) && i !== 'ntf') this[i] = test[i]
  }

  if (typeof (this._ntf) === 'object') {
    this._ntf.refcount += 1
  } else {
    this._ntf = test._ntf = {
      done: test.done,
      teardown: [],
      refcount: 1
    }
    this.done = function () {
      this._ntf.refcount -= 1
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
