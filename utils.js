const bignum = require('bignum')
const request = require('request')
const stopWords = require('./stopwords.js')
const sentiment = require('./sentiment/lib/index.js')

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
  tweet = tweet.replace(/(http:\/\/[\S]*)/ig, '')
  tweet = tweet.replace(/(https:\/\/[\S]*)/ig, '')
  tweet = tweet.replace(/[\.]@/g, 'rt@')
  tweet = tweet.replace(/[\"\.\?\!\+\,\:\(\)\/\\\*\^\|]/g, '')
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
    frequency: {},
    sentiment: {
      score: 0,
      comparative: 0,
      tokens: [],
      words: [],
      positive: [],
      negative: []
    }
  }
  if (!tweet) {
    return counts
  }
  counts.sentiment = sentiment(tweet)
  let words = tweet.slice().split(' ')
  let wordCount = words.length
  for (let i = 0; i < wordCount; i++) {
    let word = words[i].toLowerCase()
    let rt = word === 'rt'
    let mention = word.search(/(rt@)/) !== -1
    let emoji = word.search(/[^\w\s@#]rt/) !== -1
    let skip = rt || mention || emoji
    if (skip) {
      return {
        grams: {},
        frequency: {},
        sentiment: {
          score: 0,
          comparative: 0,
          tokens: [],
          words: [],
          positive: [],
          negative: []
        }
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
    'grams': {},
    'sentiment': {}
  }
  const tweetCount = tweetList.length
  let totalSentiment = 0
  let totalCompSentiment = 0
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
    totalSentiment += counts.sentiment.score
    totalCompSentiment += counts.sentiment.comparative
  }
  dictionary.sentiment.avgSentiment = totalSentiment / tweetCount
  dictionary.sentiment.avgCompSentiment = totalCompSentiment / tweetCount
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

function setScore (scores, dictionary, tweet, avgSent, avgCompSent) {
  let words = tweet.word_counts.frequency
  tweet.diffSent = Math.abs(tweet.word_counts.sentiment.score - avgSent)
  tweet.diffCompSent = Math.abs(tweet.word_counts.sentiment.comparative - avgCompSent)
  let score = 0
  for (let word in words) {
    score += scores[dictionary[word]] * words[word]
  }
  tweet.score = score / (tweet.diffCompSent + 1)
  // tweet.score = score
}

function setScoreGrams (scores, dictionary, tweet) {
  let grams = tweet.word_counts.grams
  let score = 1
  for (var gram in grams) {
    score += scores[dictionary[gram]]
  }
  tweet.score = tweet.score / score
}

function scoreTweets (scores, dictionary, tweets, grams, avgSent, avgCompSent) {
  const tweetLength = tweets.length
  for (var i = 0; i < tweetLength; i++) {
    if (grams) {
      setScoreGrams(scores, dictionary, tweets[i])
    } else {
      setScore(scores, dictionary, tweets[i], avgSent, avgCompSent)
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
  let limit = count > tweets.length ? Math.min(tweets.length, 10) : count
  let selected = {}
  let results = []
  for (var i = 0; i < limit; i++) {
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
    // console.log(array[i].text, array[i].score, array[i].diffSent, array[i].diffCompSent)
    console.log(array[i].text + '\n')
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

function isRetweet (tweet) {
  let words = cleanTweet(tweet).split(' ')
  for (var i = 0; i < words.length; i++) {
    let word = words[i].toLowerCase()
    let rt = word === 'rt'
    let mention = word.search(/(rt@)/) !== -1
    let emoji = word.search(/[^\w\s@#]rt/) !== -1
    let skip = rt || mention || emoji
    if (skip) {
      return true
    }
  }
  return false
}

function removeRetweets (list) {
  let results = []
  let num = list.length
  for (let i = 0; i < num; i++) {
    if (!isRetweet(list[i].text)) {
      results.push(list[i])
    }
  }
  return results
}

function processTweets (list, max, retweets, callback) {
  let tweetList = retweets ? list : removeRetweets(list)
  console.log('Processing', tweetList.length, 'tweets...')
  let dictionary = buildDictionary(tweetList)
  let wordScore = createScores(dictionary.frequency)
  let gramScore = createScores(dictionary.grams)
  scoreTweets(wordScore, dictionary.frequency, tweetList, false, dictionary.sentiment.avgSentiment, dictionary.sentiment.avgCompSentiment)
  scoreTweets(gramScore, dictionary.grams, tweetList, true)
  let random = randomTweets(tweetList, 10)
  sortTweets(tweetList)
  // printArray(rankDictionary(dictionary))
  printArray(printTweets(tweetList, max))
  // printArray(random)
  // printArray(tweetList.slice(-5))
  // // console.log(rankDictionary(dictionary.grams))
  callback({'selected': printTweets(tweetList, max), 'random': random, 'dictionary': dictionary})
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
