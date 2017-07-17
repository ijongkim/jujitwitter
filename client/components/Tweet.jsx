import React from 'react'

export default class Tweet extends React.Component {
  constructor (props) {
    super(props)
    this.parseTweet = this.parseTweet.bind(this)
  }

  parseTweet (tweet) {
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
    return `<h4>${copy}</h4>`
  }

  render () {
    return (
      <div className="tweetContainer panel">
        <div className="panel-header">
          <h3 className="panel-title">{`#${this.props.id}`}</h3>
        </div>
        <div className="tweetText panel-body" dangerouslySetInnerHTML={{__html: this.parseTweet(this.props.tweet.text)}}>
        </div>
        <div className="tweetFooter panel-footer">
          <span className="tweetScore col-md-3">
            <span className="btn-group">
              <button type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown">
                <span className="glyphicon glyphicon-stats"></span>{Math.floor(this.props.tweet.score)}
              </button>
            </span>
          </span>
          <span className="tweetLikes col-md-3">
            <span className="glyphicon glyphicon-heart" aria-hidden="true" />{this.props.tweet.favorite_count}
          </span>
          <span className="tweetLikes col-md-3">
            <span className="glyphicon glyphicon-retweet" aria-hidden="true" />{this.props.tweet.retweet_count}
          </span>
          <span className="tweetLikes col-md-3">
            <span className="glyphicon glyphicon-time" aria-hidden="true" />{this.props.tweet.created_at.slice(0, 11) + this.props.tweet.created_at.slice(-4)}
          </span>
        </div>
      </div>
    )
  }
}
