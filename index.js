const express = require('express')
const dotenv = require('dotenv').config()
const request = require('request')
const utils = require('./utils.js')
const app = express()

const tKey = process.env.KEY
const tSecret = process.env.SECRET
const tCombo = tKey + ':' + tSecret
const tBase = new Buffer(tCombo).toString('base64')
const token = 'AAAAAAAAAAAAAAAAAAAAAP681QAAAAAAL73UMlXKvOWiRHoWi0QY60Z90mQ%3D31GOtW4wDnMQJucsqXTbu721lEKCgHK0SNfwtujifi25aWr1g4'

// request token generated, need to request bearer token
function getBearerToken (base, token, callback) {
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
      token = JSON.parse(body)
      token = token.access_token
      if (callback) {
        callback(token)
      }
    } else {
      console.log('Error:', error)
    }
  })
}

// getBearerToken(tBase, token)

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.get('/getTweets', function (req, res) {
  if (token) {
    console.log('Requesting with token:', token)
    utils.getTweets(token, 'neiltyson', [], 0, 3200, null, function (output) { utils.processTweets(output, 10, function (data) { res.send(data) }) }, function (data) { res.send(data) })
  } else {
    console.log('Requesting token...')
    getBearerToken(tBase, token, function (output) { console.log(output) })
  }
})

app.listen(3000, function () {
  console.log('Server running on 3000')
})
