const express = require('express')
const dotenv = require('dotenv').config()
const request = require('request')
const bodyParser = require('body-parser')
const utils = require('./utils.js')
const app = express()

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
  if (storedToken) {
    console.log('Requesting with token:', storedToken)
    utils.getTweets(storedToken, utils.cleanUsername(req.body.username, 15), [], 0, 3200, null, function (output) { utils.processTweets(output, 10, true, function (data) { res.send(data) }) }, function (data) { res.send(data) })
  } else {
    console.log('Requesting token...')
    getBearerToken(tBase, function (token) { utils.getTweets(token, utils.cleanUsername(req.body.username, 15), [], 0, 3200, null, function (output) { utils.processTweets(output, 10, true, function (data) { res.send(data) }) }, function (data) { res.send(data) }) })
  }
})

app.listen(process.env.PORT, function () {
  console.log('Server running on', process.env.PORT)
})
