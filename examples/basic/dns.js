var ntf = require('../../lib/ntf')
  , test = ntf.dns()

exports.silasGithubA = test.a('silas.github.com', function(test, res) {
  test.address(res, '207.97.227.245')
  test.done()
})

exports.silasSewellCname = test.cname('silas.sewell.org', function(test, res) {
  test.name(res, 'ghs.google.com')
  test.done()
})
