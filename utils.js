const bignum = require('bignum')
const request = require('request')

function getTweets (token, username, list, currCount, maxCount, maxID, callback, errorHandle) {
  let url = 'https://api.twitter.com/1.1/statuses/user_timeline.json?count=200&screen_name=' + username + '&trim_user=true&exclude_replies=true&include_rts=false'
  url += maxID ? '&max_id=' + maxID.toString() : ''
  let options = {
    url: url,
    headers: {
      'Authorization': 'Bearer ' + token
    }
  }
  if (currCount > maxCount) {
    console.log('Starting processing')
    callback(list)
  } else {
    let id = maxID ? maxID.toString() : ''
    console.log('Getting tweets', currCount, '-', currCount + 200, 'of', maxCount, 'for', username, 'from ID:', id)
    request(options, function (error, response, body) {
      let tweets = JSON.parse(body)
      // console.log(error, body)
      if (!error && Array.isArray(tweets)) {
        list = list.concat(tweets)
        console.log(list.length, 'tweets')
        let maxID = bignum(tweets[tweets.length - 1].id_str).sub(1)
        getTweets(token, username, list, currCount + 200, maxCount, maxID, callback, errorHandle)
      } else {
        let message = 'Unspecified Error'
        if (tweets.errors) {
          message = tweets.errors[0].message
        } else if (tweets.error) {
          message = tweets.error
        }
        errorHandle(message)
      }
    })
  }
}

module.exports.getTweets = getTweets
