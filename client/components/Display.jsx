import React from 'react'
import DisplayMenu from './DisplayMenu.jsx'

export default class Display extends React.Component {
  render () {
    return (
      <div id="displayContainer" className="col-md-8 panel-body">
        <DisplayMenu />
        

        <div id="welcomePanel" class="panel">
          <h3>How does this work?</h3>
          <p>It fetches ~3200 most recent tweets, processes the collection, scores each tweet, then presents the top 10 representative tweets for you to enjoy. A random sample of 10 tweets is also available for comparison. See for yourself if the algorithm does a better job than picking at random! A chart of the user's monthly average sentiment and top 25 words are also available.</p>
          <h3>Okay, you say "representative tweet", but what's that even mean?</h3>
          <p>Fair question, a representative tweet in this instance is considered an summary reflection of the user's interests, attitude, and values or essentially: "Does this sound like something the user would say?".</p>
          <h3>How did you determine these scores?</h3>
          <p>The algorithm takes the collection of tweets, removes any retweets, then builds a word frequency and trigram frequency. Frequencies are ranked low to high and each item is assigned a value equal to its relative rank. The presence of a frequent word added more to a tweet's score, while the presence of a frequent trigram was heavily penalized. Sentiment is also taken into account by calculating an average comparative sentiment score for the collection, and reducing each tweet's score according to how far away its sentiment is to the average.</p>
        </div>
        <div id="selectedTweets">
        </div>
        <div id="randomTweets">
        </div>
        <div id="userAnalysis">
          <canvas id="sentimentCanvas" class="panel"></canvas>
          <canvas id="chartCanvas" class="panel"></canvas>
        </div>
      </div>
    )
  }
}