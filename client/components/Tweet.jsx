import React from 'react'
import utils from './../clientUtils.js'

export default class Tweet extends React.Component {
  render () {
    return (
      <div className="tweetContainer panel">
        <div className="panel-header">
          <h3 className="panel-title">{`#${this.props.id}`}</h3>
        </div>
        <div className="tweetText panel-body" dangerouslySetInnerHTML={{__html: utils.parseTweet(this.props.tweet.text, true)}}>
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
