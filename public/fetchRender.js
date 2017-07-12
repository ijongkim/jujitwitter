function bindButtons () {
  $('#submitButton').bind('click', getAndFetch)
  $(document).keydown(function (e) {
    if (e.which === 13) {
      e.preventDefault()
      getAndFetch()
    }
  })
}

function getAndFetch () {
  var inputBox = $('#submitUser')
  fetchTweets(inputBox.val())
  inputBox.val('')
}

function fetchTweets (username) {
  clearContainer('#displayContainer')
  clearContainer('#userProfile')
  updateBanner()
  if (username.length > 0) {
    renderLoading(username)
    $.ajax({
      url: '/getTweets',
      data: {username: username},
      method: 'POST',
      success: function (data) {
        renderTweets(data[0])
        renderUser(data[0][0].user)
        // renderFreq(data[1])
      }
    })
  } else {
    renderError('Please input a valid @username')
  }
}

function updateBanner (username) {
  clearContainer('#sideBanner')
  let banner = '<h1>Top 10 Representative Tweets'

  if (username) {
    banner += ` of ${username}</h1>`
  } else {
    banner += '</h1>'
  }

  $('#sideBanner').append(banner)
}

function renderTweets (tweets) {
  clearContainer('#displayContainer')
  for (var i = 0; i < tweets.length; i++) {
    $div = $('<div>', {"class": "tweetContainer panel"})
    $div.append('<div class="tweetText"><h4>' + parseTweet(tweets[i].text) + '</h4></div>')
    $footer = $('<div>', {"class": "tweetFooter panel-footer"})
    $footer.append('<span class="tweetLikes"><span class="glyphicon glyphicon-heart" aria-hidden="true"></span>' + tweets[i].favorite_count + '</span>')
    $footer.append('<span class="tweetRTs"><span class="glyphicon glyphicon-retweet" aria-hidden="true"></span>' + tweets[i].retweet_count + '</span>')
    $footer.append('<span class="tweetTime"><span class="glyphicon glyphicon-time" aria-hidden="true"></span>' + tweets[i].created_at.slice(0, 11) + tweets[i].created_at.slice(-4) + '</span>')
    $div.append($footer)
    $('#displayContainer').append($div)
  }
}

function renderUser (user) {
  updateBanner(user.name)
  let profileImage = user.profile_image_url
  profileImage = profileImage.replace(/_normal/g, '')

  $user = $('<div>', {"class": "userPicAndStats"})
  let urlInfo = user.entities.url ? user.entities.url.urls[0] : {expanded_url: '', display_url: ''}
  let userPicAndStats = `<img class="img-rounded userPic" src="${profileImage}"/>\
                        <div class="userStats"><div><h4>${parseTweet('@' + user.screen_name)}</h4>\
                        <span class="glyphicon glyphicon-user" aria-hidden="true"></span> ${parseTweet(user.description)}<br>\
                        <span class="glyphicon glyphicon-map-marker" aria-hidden="true"></span> ${user.location}<br>\
                        <span class="glyphicon glyphicon-bullhorn" aria-hidden="true"></span> ${user.followers_count}<br>\
                        <span class="glyphicon glyphicon-search" aria-hidden="true"></span> ${user.friends_count}<br>\
                        <span class="glyphicon glyphicon-globe" aria-hidden="true"></span> <a href="${urlInfo.expanded_url}">${urlInfo.display_url}</a>`

  $user.append(userPicAndStats)
  $('#userProfile').append($user)
}

function renderFreq (data) {
  $('#sidePanel').append('<p>' + JSON.stringify(data) + '</p>')
}

function renderLoading (username) {
  $('#displayContainer').append('<h2 class="tweetContainer panel">Analyzing @' + username + '\'s tweets...</h2>')
}

function renderError (message) {
  $('#displayContainer').append('<h2 class="tweetContainer panel">Error: ' + message + '!</h2>')
}

function clearContainer (selector) {
  $(selector).empty()
}

function parseTweet (tweet) {
  let copy = tweet.replace(/(http:\/\/[\S]*)/ig, '<a href="$&">$&</a>')
  copy = copy.replace(/(https:\/\/[\S]*)/ig, '<a href="$&">$&</a>')
  copy = copy.replace(/(#[\w]*)/ig, function (match) {
    let hashtag = match.slice(1)
    return `<a href="https://twitter.com/hashtag/${hashtag}">#${hashtag}</a>`
  })
  copy = copy.replace(/(@[\w]*)/ig, function (match) {
    let mention = match.slice(1)
    return `<a href="https://twitter.com/${mention}">@${mention}</a>`
  })
  return copy
}