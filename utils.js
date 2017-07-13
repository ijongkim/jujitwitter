const bignum = require('bignum')
const request = require('request')
const stopWords = require('./stopwords.js')

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
  tweet = tweet.replace(/(http:\/\/[\S]*)/ig, '')
  tweet = tweet.replace(/(https:\/\/[\S]*)/ig, '')
  tweet = tweet.replace(/[\s]+/g, ' ')
  return tweet.trim()
}

function isStopword (stopwords, word) {
  if (stopwords[word]) {
    return true
  } else {
    return false
  }
}

function countWords (tweet) {
  let counts = {
    grams: {},
    frequency: {}
  }
  if (!tweet) {
    return counts
  }
  let words = tweet.slice().split(' ')
  let wordCount = words.length
  for (let i = 0; i < wordCount; i++) {
    let word = words[i].toLowerCase()
    if (word === 'rt') {
      return {
        grams: {},
        frequency: {}
      }
    }
    if (word && !isStopword(stopWords.mini, word)) {
      if (counts.frequency[word]) {
        counts.frequency[word]++
      } else {
        counts.frequency[word] = 1
      }
    }
  }
  if (words.length < 4) {
    let gram = words.join(' ')
    gram = gram.toLowerCase()
    counts.grams[gram] = 1
  } else {
    for (let j = 0; j < words.length - 2; j++) {
      let gram = words[j] + ' ' + words[j + 1] + ' ' + words[j + 2]
      gram = gram.toLowerCase()
      counts.grams[gram] = 1
    }
  }

  return counts
}

function buildDictionary (tweetList) {
  let dictionary = {
    'frequency': {},
    'grams': {}
  }
  const tweetCount = tweetList.length
  for (let i = 0; i < tweetCount; i++) {
    let tweet = cleanTweet(tweetList[i].text)
    let counts = countWords(tweet)
    tweetList[i].word_counts = counts
    for (let word in counts.frequency) {
      if (dictionary.frequency[word]) {
        dictionary.frequency[word] += counts.frequency[word]
      } else {
        dictionary.frequency[word] = counts.frequency[word]
      }
    }
    for (let gram in counts.grams) {
      if (dictionary.grams[gram]) {
        dictionary.grams[gram] += counts.grams[gram]
      } else {
        dictionary.grams[gram] = counts.grams[gram]
      }
    }
  }
  console.log('Dictionary built')
  return dictionary
}

function createScores (dictionary) {
  let counts = []
  let countsHash = {}
  for (let word in dictionary) {
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
  for (let i = 0; i < countsLength; i++) {
    countsHash[counts[i]] = i
  }
  console.log('Scores created')
  return countsHash
}

function setScore (scores, dictionary, tweet) {
  let words = tweet.word_counts.frequency
  let score = 0
  for (let word in words) {
    score += scores[dictionary[word]]
  }
  tweet.score = score
}

function setScoreGrams (scores, dictionary, tweet) {
  let grams = tweet.word_counts.grams
  let score = 1
  for (var gram in grams) {
    score += scores[dictionary[gram]]
  }
  tweet.score = tweet.score / score
}

function scoreTweets (scores, dictionary, tweets, grams) {
  const tweetLength = tweets.length
  for (var i = 0; i < tweetLength; i++) {
    if (grams) {
      setScoreGrams(scores, dictionary, tweets[i])
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

function randomTweets (tweets, count) {
  console.log('Selecting random tweets')
  let selected = {}
  let results = []
  for (var i = 0; i < count; i++) {
    let rand = Math.floor(Math.random() * tweets.length)
    while (selected[rand]) {
      rand = Math.floor(Math.random() * tweets.length)
    }
    selected[rand] = true
    results.push(tweets[rand])
  }
  return results
}

function printArray (array) {
  for (var i = 0; i < array.length; i++) {
    console.log(array[i].text, array[i].score)
  }
}

function printObject (obj) {
  for (let key in obj) {
    console.log(key)
  }
}

function rankDictionary (dictionary) {
  var ranked = []
  for (var word in dictionary) {
    if (dictionary[word] > 0) {
      ranked.push([dictionary[word], word])
    }
  }
  ranked.sort(function (a, b) {
    return b[0] - a[0]
  })
  return ranked
}

function processTweets (tweetList, max, callback) {
  console.log('Processing', tweetList.length, 'tweets...')
  let dictionary = buildDictionary(tweetList)
  let wordScore = createScores(dictionary.frequency)
  let gramScore = createScores(dictionary.grams)
  scoreTweets(wordScore, dictionary.frequency, tweetList, false)
  scoreTweets(gramScore, dictionary.grams, tweetList, true)
  let random = randomTweets(tweetList, 10)
  sortTweets(tweetList)
  // printArray(rankDictionary(dictionary))
  // printArray(printTweets(tweetList, max))
  // printArray(random)
  // printArray(tweetList.slice(-5))
  // // console.log(rankDictionary(dictionary.grams))
  callback({'tweets': printTweets(tweetList, max).concat(random), 'dictionary': dictionary})
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
module.exports.setScoreNorm = setScoreGrams
module.exports.scoreTweets = scoreTweets
module.exports.sortTweets = sortTweets
module.exports.printTweets = printTweets
module.exports.processTweets = processTweets
module.exports.cleanUsername = cleanUsername
