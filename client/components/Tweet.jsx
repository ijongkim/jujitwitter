import React from 'react'
import utils from './../clientUtils.js'

export default class Tweet extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showDetails: false
    }
    this.processScores = this.processScores.bind(this)
    this.toggleDetails = this.toggleDetails.bind(this)
    this.renderContainer = this.renderContainer.bind(this)
    this.renderStats = this.renderStats.bind(this)
    this.renderInner = this.renderInner.bind(this)
  }

  processScores (words, grams) {
    let processedWords = words.sort(function (a, b) {
      return b[1] - a[1]
    }).slice(0, 10)
    let processedGrams = grams.sort(function (a, b) {
      return b[1] - a[1]
    }).slice(0, 5)
    return {words: processedWords, grams: processedGrams}
  }

  toggleDetails () {
    this.setState({showDetails: !this.state.showDetails})
  }

  renderContainer (words, grams) {
    if (words.length > 0 && grams.length > 0) {
      return (
        <div className="statsContainer">
          {this.renderStats(words, 'Word Scores')}
          {this.renderStats(grams, 'Gram Scores')}
        </div>
      )
    } else if (words.length > 0) {
      return (
        <div className="statsContainer">
          {this.renderStats(words, 'Word Scores')}
        </div>
      )
    }
  }

  renderStats (stats, title) {
    return (
      <span className="statsDisplay">
        <span className="statTitle">{title}</span>
        {this.renderInner(stats)}
      </span>
    )
  }

  renderInner (stats) {
    if (stats.length > 5) {
      let stats1 = stats.slice(0, 5)
      let stats2 = stats.slice(5)
      let inner1 = stats1.map(function (item, id) {
        return <div key={id} className="singleStat">{`${item[0]} : ${item[1]}`}</div>
      })
      let inner2 = stats2.map(function (item, id) {
        return <div key={id} className="singleStat">{`${item[0]} : ${item[1]}`}</div>
      })
      return (
        <div style={{display: 'flex'}}>
          <span className="insidePanel">
            {inner1}
          </span>
          <span className="insidePanel">
            {inner2}
          </span>
        </div>
      )
    } else {
      let inner = stats.map(function (item, id) {
        return <div key={id} className="singleStat">{`${item[0]} : ${item[1]}`}</div>
      })
      return (
        <span className="insidePanel">
          {inner}
        </span>
      )
    }
  }

  render () {
    let info = this.processScores(this.props.tweet.word_scores, this.props.tweet.gram_scores)
    let stats = this.state.showDetails ? this.renderContainer(info.words, info.grams) : ''
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
              <button onClick={this.toggleDetails} type="button" className="btn btn-default dropdown-toggle" data-toggle="dropdown">
                <span className="glyphicon glyphicon-stats" />{Math.floor(this.props.tweet.score)}
              </button>
            </span>
          </span>
          {stats}
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
