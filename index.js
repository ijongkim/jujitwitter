const express = require('express')
const request = require('request')
const bignum = require('bignum')
const app = express()

app.get('/', function (req, res) {
  res.send('Hello World!')
})

app.listen(3000, function () {
  console.log('Server running on 3000')
})
