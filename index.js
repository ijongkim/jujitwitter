const express = require('express')
const app = express()
const server = require('http').Server(app)
const dotenv = require('dotenv').config()
const request = require('request')
const bodyParser = require('body-parser')
const io = require('socket.io')(server)
module.exports.io = io
const utils = require('./utils.js')

const tKey = process.env.KEY
const tSecret = process.env.SECRET
const tCombo = tKey + ':' + tSecret
const tBase = new Buffer(tCombo).toString('base64')
let storedToken = ''

function getBearerToken (base, callback) {
  let options = {
    url: 'https://api.twitter.com/oauth2/token',
    headers: {
      'User-Agent': 'JujiTwitter',
      'Authorization': 'Basic ' + base,
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8.'
    },
    body: 'grant_type=client_credentials'
  }
  request.post(options, function (error, response, body) {
    if (!error) {
      let temp = JSON.parse(body)
      setToken(temp.access_token)
      if (callback) {
        callback(temp.access_token)
      }
    } else {
      console.log('Error:', error)
    }
  })
}

function setToken (token) {
  storedToken = token
}

getBearerToken(tBase)

app.use(bodyParser.json())
app.use(express.static('client'))

app.post('/getTweets', function (req, res) {
  let params = {
    socket: req.body.socketID,
    token: storedToken || '',
    username: utils.cleanUsername(req.body.username, 15),
    list: []
  }
  let options = {
    currCount: 0,
    maxCount: 3200,
    maxID: null
  }
  if (storedToken) {
    console.log('Requesting with token:', storedToken)
    utils.getTweets(params, options, function (output, socket) {
      utils.processTweets(output, 10, true, socket, function (data) {
        res.send(data)
      })
    }, function (data) {
      res.send(data)
    })
  } else {
    console.log('Requesting token...')
    getBearerToken(tBase, function (token) {
      params.token = token
      utils.getTweets(params, options, function (output, socket) {
        utils.processTweets(output, 10, true, socket, function (data) {
          res.send(data)
        })
      }, function (data) {
        res.send(data)
      })
    })
  }
})

io.on('connection', function (socket) {
  console.log('connected', socket.id)
  socket.emit('socketID', socket.id)
})

io.on('fetchUser', function (socket) {
  console.log('fetching')
})

server.listen(process.env.PORT, function () {
  console.log('Server running on', process.env.PORT)
})
