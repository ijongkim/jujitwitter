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
  renderLoading()
  console.log('Fetching', username)
  $.ajax({
    url: '/getTweets',
    data: {username: username},
    method: 'POST',
    success: renderTweets
  })
}

function renderTweets (tweets) {
  clearContainer('#displayContainer')
  for (var i = 0; i < tweets.length; i++) {
    $div = $('<div>', {"class": "tweetContainer col-xs-5 col-sm-5 col-md-5 panel-default"})
    $div.append('<span class="tweetText panel-body">' + tweets[i].text + '</span><br>')
    $footer = $('<div>', {"class": "panel-footer"})
    $footer.append('<span class="tweetLikes">Likes: ' + tweets[i].favorite_count + '</span>')
    $footer.append('<span class="tweetRTs">Retweets: ' + tweets[i].retweet_count + '</span>')
    $footer.append('<span class="tweetTime">Created On: ' + tweets[i].created_at.slice(0, 11) + tweets[i].created_at.slice(-4) + '</span>')
    $div.append($footer)
    $('#displayContainer').append($div)
  }
}

function renderLoading () {
  $('#displayContainer').append('<h2>Fetching tweets...</h2>')
}

function clearContainer (selector) {
  $(selector).empty()
}