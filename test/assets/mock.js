var Test = function(test) {
  this.asserts = []
  this.test = test
  return this
}

Test.prototype.push = function(type, args) {
  this.asserts.push({ type: type, args: Array.prototype.slice.call(args) })
}

Test.prototype.ok = function() {
  this.push('ok', arguments)
}

Test.prototype.equal = function() {
  this.push('equal', arguments)
}

Test.prototype.deepEqual = function() {
  this.push('deepEqual', arguments)
}

Test.prototype.assertOk = function(value) {
  var a = this.asserts.shift()
  this.test.equal(a.type, 'ok')
  this.test.ok(value == false ? !a.args[0] : a.args[0])
}

Test.prototype.assertEqual = function(value) {
  var a = this.asserts.shift()
  this.test.equal(a.type, 'equal')
  if (value === false) {
    this.test.notEqual(a.args[0], a.args[1])
  } else {
    this.test.equal(a.args[0], a.args[1])
  }
}

Test.prototype.assertDeepEqual = function(value) {
  var a = this.asserts.shift()
  this.test.equal(a.type, 'deepEqual')
  if (value === false) {
    this.test.notDeepEqual(a.args[0], a.args[1])
  } else {
    this.test.deepEqual(a.args[0], a.args[1])
  }
}

var AssertTest = exports.AssertTest = function(test, module) {
  var self = this
  Object.keys(module.asserts).forEach(function(name) {
    self[name] = module.asserts[name]
  })
  return Test.call(this, test)
}

AssertTest.prototype = new Test()
AssertTest.prototype.constructor = AssertTest

var HttpAssertTest = exports.HttpAssertTest = function(test, module) {
  this._ntf = { meta: {}, teardown: [], parentOpts: {} }
  this.ntf = {}
  return AssertTest.call(this, test, module)
}

HttpAssertTest.prototype = new Test()
HttpAssertTest.prototype.constructor = HttpAssertTest
