var ntf = require('../../lib')
  , dns = ntf.dns()

exports.a = dns.a('google-public-dns-a.google.com', function(test) {
  test.address('8.8.8.8')
  test.done()
})

exports.aaaa = dns.aaaa('google-public-dns-a.google.com', function(test) {
  test.address('2001:4860:4860::8888')
  test.done()
})

exports.cname = dns.cname('www.google.com', function(test) {
  test.name('www.l.google.com')
  test.done()
})

exports.mx = dns.mx('gmail.com', function(test) {
  test.name('gmail-smtp-in.l.google.com')
  test.done()
})

exports.ns = dns.ns('google.com', function(test) {
  test.name('ns1.google.com')
  test.done()
})

exports.ptr = dns.ptr('8.8.8.8', function(test) {
  test.name('google-public-dns-a.google.com')
  test.done()
})

exports.srv = dns.srv('_jabber._tcp.google.com', function(test) {
  test.name('xmpp-server.l.google.com')
  test.done()
})

exports.txt = dns.txt('google.com', function(test) {
  test.ok(test.answer()[0].match(/^v=spf1/))
  test.done()
})
