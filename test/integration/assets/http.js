var http = require('http')
  , assert = require('assert')
  , express = require('express')

exports.createServer = function(options) {
  var app = express();

  app.configure(function() {
    app.use(express.cookieParser())
    app.use(express.bodyParser())
    app.use(express.session({ secret: 'secret' }))
  })

  app.get('/buffer', function(req, res) {
    res.send(new Buffer('buffer'))
  })

  app.get('/cookie', function(req, res) {
    res.cookie('key', 'value')
    Object.keys(req.cookies).forEach(function(k) {
      res.cookie('key-' + k, 'value-' + req.cookies[k]) 
    })
    res.send(200)
  })

  app.post('/form', function(req, res) {
    var form = { hello: 'world' }
    assert.deepEqual(req.body, form)
    res.json(req.body, 200)
  })

  app.get('/json', function(req, res) {
    res.json({ text: 'abc', number: 123 })
  })

  app.post('/json', function(req, res) {
    var json = { text: 'abc', number: 123 }
    assert.deepEqual(req.body, json)
    res.json(req.body, 200)
  })

  app.get('/session', function(req, res) {
    var value = req.session.value || 'none'
    if (req.query.value) {
      req.session.value = req.query.value
    }
    res.json({ value: value })
  })

  return http.createServer(app)
}
