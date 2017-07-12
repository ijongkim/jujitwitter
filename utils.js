const bignum = require('bignum')
const request = require('request')

function getTweets (token, username, list, currCount, maxCount, maxID, callback, errorHandle) {
  let url = 'https://api.twitter.com/1.1/statuses/user_timeline.json?count=200&screen_name=' + username + '&exclude_replies=true&include_rts=false'
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
      if (!error && Array.isArray(tweets)) {
        if (tweets.length === 0) {
          console.log('Starting processing')
          callback(list)
        } else {
          list = list.concat(tweets)
          console.log(list.length, 'tweets')
          let maxID = bignum(tweets[tweets.length - 1].id_str).sub(1)
          getTweets(token, username, list, currCount + 200, maxCount, maxID, callback, errorHandle)
        }
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

function cleanTweet (original) {
  let tweet = original.slice()
  tweet = tweet.replace(/[\n]/g, ' ')
  tweet = tweet.replace(/[".?!+,]/g, '')
  tweet = tweet.replace(/(http:\/\/[\S]*)/g, '')
  tweet = tweet.replace(/(https:\/\/[\S]*)/g, '')
  return tweet
}

function isStopword (word) {
  const stopWords = {
    'a': 1,
    'an': 1,
    'and': 1,
    'are': 1,
    'as': 1,
    'at': 1,
    'be': 1,
    'by': 1,
    'for': 1,
    'from': 1,
    'has': 1,
    'he': 1,
    'in': 1,
    'is': 1,
    'it': 1,
    'its': 1,
    'of': 1,
    'on': 1,
    'she': 1,
    'that': 1,
    'the': 1,
    'to': 1,
    'was': 1,
    'were': 1,
    'will': 1,
    'with': 1
  }
  if (stopWords[word]) {
    return true
  } else {
    return false
  }
}

function countWords (tweet) {
  let words = tweet.slice().split(' ')
  let counts = {}
  let wordCount = words.length
  for (var i = 0; i < wordCount; i++) {
    let word = words[i].toLowerCase()
    if (word) {
    }
    if (word && !isStopword(word)) {
      if (counts[word]) {
        counts[word]++
      } else {
        counts[word] = 1
      }
    }
  }
  return counts
}

function buildDictionary (tweetList) {
  var dictionary = {}
  const tweetCount = tweetList.length
  for (var i = 0; i < tweetCount; i++) {
    let tweet = cleanTweet(tweetList[i].text)
    let counts = countWords(tweet)
    tweetList[i].word_count = counts
    for (var key in counts) {
      if (dictionary[key]) {
        dictionary[key] += counts[key]
      } else {
        dictionary[key] = counts[key]
      }
    }
  }
  console.log('Dictionary built')
  return dictionary
}

function createScores (dictionary) {
  let counts = []
  let countsHash = {}
  for (var word in dictionary) {
    if (countsHash[dictionary[word]]) {
      continue
    } else {
      countsHash[dictionary[word]] = true
      counts.push(dictionary[word])
    }
  }
  counts.sort(function (a, b) {
    return a - b
  })
  let countsLength = counts.length
  for (var i = 0; i < countsLength; i++) {
    countsHash[counts[i]] = i + 1
  }
  console.log('Scores created')
  return countsHash
}

function setScore (scores, dictionary, tweet) {
  let words = tweet.word_count
  let score = 0
  for (var word in words) {
    score += scores[dictionary[word]]
  }
  tweet.score = score
}

function setScoreNorm (scores, dictionary, tweet) {
  let words = tweet.word_count
  let score = 0
  let num = 0
  for (var word in words) {
    num++
    score += scores[dictionary[word]]
  }
  tweet.score = score / num
}

function scoreTweets (scores, dictionary, tweets, normalize) {
  const tweetLength = tweets.length
  for (var i = 0; i < tweetLength; i++) {
    if (normalize) {
      setScoreNorm(scores, dictionary, tweets[i])
    } else {
      setScore(scores, dictionary, tweets[i])
    }
  }
  console.log('Scores calculated')
}

function sortTweets (tweets) {
  return tweets.sort(function (a, b) {
    if (a.score === b.score) {
      return b.favorite_count - a.favorite_count
    } else {
      return b.score - a.score
    }
  })
}

function printTweets (tweets, count) {
  let limit = count > tweets.length ? Math.min(tweets.length, 10) : count
  return tweets.slice(0, limit)
}

function processTweets (tweetList, max, callback) {
  console.log('Processing', tweetList.length, 'tweets...')
  let dictionary = buildDictionary(tweetList)
  let scoreSheet = createScores(dictionary)
  scoreTweets(scoreSheet, dictionary, tweetList, false)
  sortTweets(tweetList)
  callback([printTweets(tweetList, max), dictionary])
}

function cleanUsername (username, max) {
  let name = username.replace(/[^a-zA-Z0-9_]/g, '')
  return name.slice(0, max)
}

module.exports.getTweets = getTweets
module.exports.cleanTweet = cleanTweet
module.exports.isStopword = isStopword
module.exports.countWords = countWords
module.exports.buildDictionary = buildDictionary
module.exports.createScores = createScores
module.exports.setScore = setScore
module.exports.setScoreNorm = setScoreNorm
module.exports.scoreTweets = scoreTweets
module.exports.sortTweets = sortTweets
module.exports.printTweets = printTweets
module.exports.processTweets = processTweets
module.exports.cleanUsername = cleanUsername
