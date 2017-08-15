import React from 'react'
import Tweet from './Tweet.jsx'

export default class TweetList extends React.Component {
  render () {
    const list = this.props.tweets.map((tweet, id) => <Tweet key={id} id={id + 1} tweet={tweet} />)
    return (
      <div id="selectedTweets">
        {list}
      </div>
    )
  }
}
