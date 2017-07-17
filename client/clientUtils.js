function imageExists (imageUrl) {
  let http = new XMLHttpRequest()
  http.open('HEAD', imageUrl, false)
  http.send()
  return http.status !== 404
}

function cleanUsername (username, max) {
  let name = username.replace(/[^a-zA-Z0-9_]/g, '')
  return name.slice(0, max)
}

function addCommas (num) {
  let text = num.toString()
  let remain = text.length % 3
  let commas = text.substr(0, remain)
  for (var i = remain; i < text.length; i += 3) {
    if (i === 0) {
      commas += text.substr(i, 3)
    } else {
      commas += ',' + text.substr(i, 3)
    }
  }
  return commas
}

function parseTweet (tweet, isTweet) {
  let copy = tweet.replace(/(http:\/\/[\S]*)/ig, '<a href="$&" target="_blank">$&</a>')
  copy = copy.replace(/(https:\/\/[\S]*)/ig, '<a href="$&" target="_blank">$&</a>')
  copy = copy.replace(/(#[\w]*)/ig, function (match) {
    let hashtag = match.slice(1)
    return `<a href="https://twitter.com/hashtag/${hashtag}" target="_blank">#${hashtag}</a>`
  })
  copy = copy.replace(/(@[\w]*)/ig, function (match) {
    let mention = match.slice(1)
    return `<a href="https://twitter.com/${mention}" target="_blank">@${mention}</a>`
  })
  return isTweet ? `<h4>${copy}</h4>` : copy
}

module.exports.imageExists = imageExists
module.exports.parseTweet = parseTweet
module.exports.cleanUsername = cleanUsername
module.exports.addCommas = addCommas
