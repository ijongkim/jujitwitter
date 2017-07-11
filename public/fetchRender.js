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
    $('#displayContainer').append('<div>' + tweets[i] + '</div>')
  }
}

function renderLoading () {
  $('#displayContainer').append('<h2>Fetching tweets...</h2>')
}

function clearContainer (selector) {
  $(selector).empty()
}