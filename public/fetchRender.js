function bindButtons () {
  var button = $('#submitButton')
  if (button) {
    button.bind('click', getAndFetch)
  } else {
    setTimeout(bindButtons, 1000)
  }
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
    $div = $('<div>', {"class": "tweetContainer"})
    $div.append('<span class="tweetText">' + tweets[i].text + '</span><br>')
    $div.append('<span class="tweetLikes">Likes: ' + tweets[i].favorite_count + '</span>')
    $div.append('<span class="tweetRTs">Retweets: ' + tweets[i].retweet_count + '</span>')
    $div.append('<span class="tweetTime">Created On: ' + tweets[i].created_at.slice(0, 11) + tweets[i].created_at.slice(-4) + '</span>')
    $('#displayContainer').append($div)
  }
}

function renderLoading () {
  $('#displayContainer').append('<h2>Fetching tweets...</h2>')
}

function clearContainer (selector) {
  $(selector).empty()
}