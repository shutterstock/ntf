var ntf = require('../../lib')
  , dns = ntf.dns()

exports.a = dns.a('a.dns.ntfjs.org', function(test) {
  test.address('127.0.0.1')
  test.done()
})

exports.aaaa = dns.aaaa('aaaa.dns.ntfjs.org', function(test) {
  test.address('::1')
  test.done()
})

exports.cname = dns.cname('cname.dns.ntfjs.org', function(test) {
  test.name('a.dns.ntfjs.org')
  test.done()
})

exports.mx = dns.mx('mx.dns.ntfjs.org', function(test) {
  test.name('mx1.dns.ntfjs.org')
  test.done()
})

exports.ns = dns.mx('ns.dns.ntfjs.org', function(test) {
  test.name('ns1.dns.ntfjs.org')
  test.done()
})

exports.ptr = dns.mx('50.116.49.237', function(test) {
  test.name('hub.sewell.org')
  test.done()
})

exports.srv = dns.srv('_ntfjs', function(test) {
  test.name('srv1.dns.ntfjs.org')
  test.done()
})

exports.txt = dns.txt('_ntfjs', function(test) {
  test.done()
})
