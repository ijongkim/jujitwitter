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
  if (username.length > 0) {
    renderLoading(username)
    $.ajax({
      url: '/getTweets',
      data: {username: username},
      method: 'POST',
      success: renderTweets
    })
  } else {
    renderError('Please input a valid @username')
  }
}

function renderTweets (tweets) {
  clearContainer('#displayContainer')
  for (var i = 0; i < tweets.length; i++) {
    $div = $('<div>', {"class": "tweetContainer panel"})
    $div.append('<div class="tweetText"><h4>' + tweets[i].text + '</h4></div>')
    $footer = $('<div>', {"class": "tweetFooter panel-footer"})
    $footer.append('<span class="tweetLikes">Likes: ' + tweets[i].favorite_count + '</span>')
    $footer.append('<span class="tweetRTs">Retweets: ' + tweets[i].retweet_count + '</span>')
    $footer.append('<span class="tweetTime">Created On: ' + tweets[i].created_at.slice(0, 11) + tweets[i].created_at.slice(-4) + '</span>')
    $div.append($footer)
    $('#displayContainer').append($div)
  }
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