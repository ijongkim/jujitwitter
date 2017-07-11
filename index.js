const express = require('express')
const dotenv = require('dotenv').config()
const request = require('request')
const bignum = require('bignum')
const utils = require('./utils.js')
const app = express()

const tKey = process.env.KEY
const tSecret = process.env.SECRET
const tCombo = tKey + ':' + tSecret
const tBase = new Buffer(tCombo).toString('base64')
const token = ''

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

getBearerToken(tBase, token, function (output) { console.log(output) })

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(3000, function () {
  console.log('Server running on 3000')
})
