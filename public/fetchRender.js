let currentTab = ''
let bannerMessages = {
  '#selectedTweets': 'Top 10 Tweets',
  '#randomTweets': 'Random Tweets',
  '#userAnalysis': 'User Analysis'
}

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
  if (currentTab) {
    switchDisplay(currentTab, '#selectedTweets')
  }
  clearContainer('#selectedTweets')
  clearContainer('#randomTweets')
  clearContainer('#userAnalysis')
  clearContainer('#displayMenu')
  renderLoading()
  if (username.length > 0) {
    updateTopBanner('Analyzing @' + cleanUsername(username, 15) + '\'s tweets...')
    $.ajax({
      url: '/getTweets',
      data: {username: username},
      method: 'POST',
      success: function (data) {
        if (typeof data === 'string') {
          updateTopBanner(data)
        } else {
          updateTopBanner('Top 10 Tweets')
        }
        renderSwitch()
        renderTweets(data.selected, '#selectedTweets')
        currentTab = '#selectedTweets'
        renderTweets(data.random, '#randomTweets')
        $('#randomTweets').hide()
        renderUser(data.selected[0].user)
        // renderFreq(data[1])
      }
    })
  } else {
    updateTopBanner('Please input a valid @username')
  }
}

function printTweets (list) {
  for (var i = 0; i < list.length; i++) {
    console.log(list[i].text)
  }
}

function renderTweets (tweets, container) {
  clearContainer(container)
  for (var i = 0; i < tweets.length; i++) {
    $div = $('<div>', {"class": "tweetContainer panel"})
    $header = $('<div>', {"class": "panel-header"})
    $header.append('<h3 class="panel-title">#' + (i + 1) + '</h3>')
    $div.append($header)
    $div.append('<div class="tweetText panel-body"><h4>' + parseTweet(tweets[i].text) + '</h4></div>')
    $footer = $('<div>', {"class": "tweetFooter panel-footer"})
    $footer.append('<span class="tweetScore"><span class="glyphicon glyphicon-stats" aria-hidden="true"></span>' + Math.floor(tweets[i].score) + '</span>')
    $footer.append('<span class="tweetLikes"><span class="glyphicon glyphicon-heart" aria-hidden="true"></span>' + tweets[i].favorite_count + '</span>')
    $footer.append('<span class="tweetRTs"><span class="glyphicon glyphicon-retweet" aria-hidden="true"></span>' + tweets[i].retweet_count + '</span>')
    $footer.append('<span class="tweetTime"><span class="glyphicon glyphicon-time" aria-hidden="true"></span>' + tweets[i].created_at.slice(0, 11) + tweets[i].created_at.slice(-4) + '</span>')
    $div.append($footer)
    $(container).append($div)
  }
}

function imageExists (imageUrl) {
  let http = new XMLHttpRequest()
  http.open('HEAD', imageUrl, false)
  http.send()
  return http.status !== 404
}

function renderUser (user) {
  clearContainer('#sidePanel')
  let profileImage = user.profile_image_url_https
  let profileImageBig = profileImage.replace(/_normal/g, '')
  profileImage = imageExists(profileImageBig) ? profileImageBig : profileImage

  $user = $('<div>', {"class": "userPicAndStats"})
  let urlInfo = user.entities.url ? user.entities.url.urls[0] : {expanded_url: '', display_url: ''}
  let userPicAndStats = `<img class="img-rounded userPic" src="${profileImage}"/>\
                        <div class="userStats"><h2>${user.name}</h2><h4>${parseTweet('@' + user.screen_name)}</h4>\
                        <span class="glyphicon glyphicon-user" aria-hidden="true"></span> ${parseTweet(user.description)}<br>\
                        <span class="glyphicon glyphicon-map-marker" aria-hidden="true"></span> ${user.location}<br>\
                        <span class="glyphicon glyphicon-bullhorn" aria-hidden="true"></span> ${addCommas(user.followers_count)}<br>\
                        <span class="glyphicon glyphicon-search" aria-hidden="true"></span> ${addCommas(user.friends_count)}<br>\
                        <span class="glyphicon glyphicon-globe" aria-hidden="true"></span> <a href="${urlInfo.expanded_url}" target="_blank>${urlInfo.display_url}</a></div>`

  $user.append(userPicAndStats)
  $('#sidePanel').append($user)
}

function renderFreq (data) {
  $('#sidePanel').append('<p>' + JSON.stringify(data) + '</p>')
}

function bindSwitch (button, container) {
  $(button).bind('click', function () {
    switchDisplay(currentTab, container)
  })
}

function renderSwitch () {
  clearContainer('#displayMenu')
  $menu = $('<div>', {"class": "row"})
  $menu.append('<div class="col-lg-4"><button id="selectedButton" type="button" class="btn btn-default btn-block"><span class="glyphicon glyphicon-search" aria-hidden="true"></span> Selected Tweets</button></div>')
  $menu.append('<div class="col-lg-4"><button id="randomButton" type="button" class="btn btn-default btn-block"><span class="glyphicon glyphicon-random" aria-hidden="true"></span> Random Tweets</button></div>')
  $menu.append('<div class="col-lg-4"><button id="analysisButton" type="button" class="btn btn-default btn-block"><span class="glyphicon glyphicon-stats" aria-hidden="true"></span> User Analysis</button></div>')
  $('#displayMenu').append($menu)
  bindSwitch('#selectedButton', '#selectedTweets')
  bindSwitch('#randomButton', '#randomTweets')
  bindSwitch('#analysisButton', '#userAnalysis')
}

function switchDisplay (current, next) {
  $(current).hide()
  $(next).show()
  if (bannerMessages[next]) {
    updateTopBanner(bannerMessages[next])
  }
  currentTab = next
}

function updateTopBanner (message) {
  clearContainer('#displayBanner')
  $('#displayBanner').append('<span>' + message + '</span>')
}

function renderLoading () {
  clearContainer('#sidePanel')
  $('#sidePanel').append('<img id="loadingGif" class="img-responsive" src="/loader.gif"/>')
}

function clearContainer (selector) {
  $(selector).empty()
}

function parseTweet (tweet) {
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
  return copy
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

function cleanUsername (username, max) {
  let name = username.replace(/[^a-zA-Z0-9_]/g, '')
  return name.slice(0, max)
}
