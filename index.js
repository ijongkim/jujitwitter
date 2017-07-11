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
console.log(tCombo + '\n' + tBase)

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(3000, function () {
  console.log('Server running on 3000')
})
