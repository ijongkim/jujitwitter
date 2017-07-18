const bignum = require('bignum')
const request = require('request')
const stopWords = require('./stopwords.js')
const sentiment = require('./sentiment/lib/index.js')
const useStop = stopWords.std
const io = require('./index.js').io

function updateClient (id, tag, data) {
  io.to(id).emit(tag, data)
}

function getTweets (params, options, callback, errorHandle) {
  let url = 'https://api.twitter.com/1.1/statuses/user_timeline.json?count=200&screen_name=' + params.username + '&exclude_replies=true&include_rts=false'
  url += options.maxID ? '&max_id=' + options.maxID.toString() : ''
  let reqOptions = {
    url: url,
    headers: {
      'Authorization': 'Bearer ' + params.token
    }
  }
  if (options.currCount > options.maxCount) {
    console.log('Starting processing')
    updateClient(params.socket, 'loadingData', {text: `All done!`, progress: 100})
    callback(params.list, params.socket)
  } else {
    if (options.currCount === 0) {
      console.log('Fetching', params.username)
      updateClient(params.socket, 'loadingData', {text: `Fetching @${params.username}'s tweets...`, progress: 5})
    }
    request(reqOptions, function (error, response, body) {
      let tweets = JSON.parse(body)
      if (!error && Array.isArray(tweets)) {
        if (tweets.length === 0) {
          console.log('Starting processing')
          callback(params.list)
        } else {
          params.list = params.list.concat(tweets)
          if (!options.maxID) {
            console.log(params.list[0].user)
            updateClient(params.socket, 'userFound', {user: params.list[0].user})
          }
          console.log(`${options.currCount} of ${options.maxCount}`)
          updateClient(params.socket, 'loadingData', {text: `${params.list.length} tweets found...`, progress: (((options.currCount / 200) + 1) * 6)})
          options.maxID = bignum(tweets[tweets.length - 1].id_str).sub(1)
          options.currCount += 200
          getTweets(params, options, callback, errorHandle)
        }
      } else {
        let message = 'Unspecified Error'
        if (tweets.errors) {
          message = tweets.errors[0].message
        } else if (tweets.error) {
          message = tweets.error
        }
        updateClient(params.socket, 'loadingData', {text: message, progress: (((options.currCount / 200) * 6)), error: true})
        errorHandle({user: {}, selected: [], random: [], stats: {}})
      }
    })
  }
}

function cleanTweet (original) {
  let tweet = original.slice()
  return tweet.replace(/[\n]/g, ' ')
              .replace(/(http:\/\/[\S]*)/ig, '')
              .replace(/(https:\/\/[\S]*)/ig, '')
              .replace(/[a-zA-Z0-9\"\.\?\!\+\,\:\(\)\/\\\*\^\|&]@/g, 'rt@')
              .replace(/[\s\b][-—_]+[\s\b]/g, ' ')
              .replace(/[\"\.\?\!\+\,\:\(\)\/\\\*\^\|]/g, '')
              .replace(/[\s]+/g, ' ')
              .trim()
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
    let rt = word === 'rt' || word === 'mt'
    let mention = word.search(/(rt@)/) !== -1 || word.search(/(mt@)/) !== -1
    let emoji = word.search(/[^\w\s@#]rt/) !== -1 || word.search(/[^\w\s@#]mt/) !== -1
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
    if (word && !isStopword(useStop, word)) {
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
  let wordScores = []
  for (let word in words) {
    score += scores[dictionary[word]] * Math.pow(1.05, words[word])
    wordScores.push([word, scores[dictionary[word]]])
  }
  tweet.score = score / (tweet.diffCompSent + 1)
  // tweet.score = score / (tweet.diffSent + 1)
  // tweet.score = score
  tweet.word_scores = wordScores
}

function setScoreGrams (scores, dictionary, tweet) {
  let grams = tweet.word_counts.grams
  let score = 1
  let gramScores = []
  for (var gram in grams) {
    score += scores[dictionary[gram]]
    if (scores[dictionary[gram]] > 0) {
      gramScores.push([gram, scores[dictionary[gram]]])
    }
  }
  tweet.score = tweet.score / score
  tweet.gram_scores = gramScores
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

function getTopRanks (dictionary, count) {
  let ranked = []
  let final = []
  for (let word in dictionary) {
    if (dictionary[word] > 0) {
      ranked.push([word, dictionary[word]])
    }
  }
  ranked.sort(function (a, b) {
    return b[1] - a[1]
  })
  let limit = ranked.length < count ? Math.min(10, ranked.length) : count
  for (let i = 0; i < limit; i++) {
    final.push(ranked[i])
  }
  return final
}

function getDate (string) {
  const months = {
    'Jan': 1,
    'Feb': 2,
    'Mar': 3,
    'Apr': 4,
    'May': 5,
    'Jun': 6,
    'Jul': 7,
    'Aug': 8,
    'Sep': 9,
    'Oct': 10,
    'Nov': 11,
    'Dec': 12
  }
  let dString = string.slice()
  let month = months[dString.substr(4, 3)]
  let date = parseInt(dString.substr(8, 2))
  let hour = parseInt(dString.substr(11, 2))
  let min = parseInt(dString.substr(14, 2))
  let sec = parseInt(dString.substr(17, 2))
  let year = parseInt(dString.substr(26, 4))
  let d = new Date(year, month)
  return d
}

function sentimentTimeline (tweets) {
  let results = []
  let groups = {}
  let limit = tweets.length
  for (let i = 0; i < limit; i++) {
    let d = getDate(tweets[i].created_at)
    results.push([`${d.getMonth() + 1}-${d.getFullYear()}`, tweets[i].word_counts.sentiment.score])
  }
  for (var j = 0; j < limit; j++) {
    let date = results[j][0]
    if (groups[date]) {
      groups[date].push(results[j][1])
    } else {
      groups[date] = [results[j][1]]
    }
  }
  results = []
  for (var date in groups) {
    var sum = groups[date].reduce(function (sum, value) {
      return sum + value
    }, 0)
    results.push([date, sum / groups[date].length])
  }
  results.sort(function (a, b) {
    let aDate = a[0].split('-')
    let bDate = b[0].split('-')
    let aMonth = parseInt(aDate[0])
    let aYear = parseInt(aDate[1])
    let bMonth = parseInt(bDate[0])
    let bYear = parseInt(bDate[1])

    if (bDate[1] === aDate[1]) {
      return aMonth - bMonth
    } else {
      return aYear - bYear
    }
  })
  return results
}

function isRetweet (tweet) {
  let words = cleanTweet(tweet).split(' ')
  for (var i = 0; i < words.length; i++) {
    let word = words[i].toLowerCase()
    let rt = word === 'rt' || word === 'mt'
    let mention = word.search(/(rt@)/) !== -1 || word.search(/(mt@)/) !== -1
    let emoji = word.search(/[^\w\s@#]rt/) !== -1 || word.search(/[^\w\s@#]mt/) !== -1
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

function processTweets (list, max, removeRTs, socket, callback) {
  let tweetList = removeRTs ? removeRetweets(list) : list
  console.log('Processing', tweetList.length, 'tweets...')
  let dictionary = buildDictionary(tweetList)
  let wordScore = createScores(dictionary.frequency)
  let gramScore = createScores(dictionary.grams)
  scoreTweets(wordScore, dictionary.frequency, tweetList, false, dictionary.sentiment.avgSentiment, dictionary.sentiment.avgCompSentiment)
  scoreTweets(gramScore, dictionary.grams, tweetList, true)
  let random = removeRTs ? randomTweets(tweetList, 10) : randomTweets(removeRetweets(tweetList), 10)
  sortTweets(tweetList)
  callback({ 'selected': printTweets(tweetList, max), 'random': random, 'stats': { frequency: getTopRanks(dictionary.frequency, 25), sentiment: sentimentTimeline(tweetList) } })
}

function cleanUsername (username, max) {
  let name = username.replace(/[^a-zA-Z0-9_]/g, '')
  return name.slice(0, max)
}

module.exports.getTweets = getTweets
module.exports.processTweets = processTweets
module.exports.cleanUsername = cleanUsername
