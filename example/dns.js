var ntf = require('../lib')
  , test = ntf.dns()

exports.silasGithubCom = test.a('silas.github.com', function(test) {
  test.address('207.97.227.245')
  test.done()
})

exports.silasSewellOrg = test.cname('silas.sewell.org', function(test) {
  test.name('silas.github.com')
  test.done()
})
