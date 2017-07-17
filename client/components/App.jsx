/*
    ./client/components/App.jsx
*/
import React from 'react'
import Menu from './Menu.jsx'
import Display from './Display.jsx'
import request from 'superagent'
import utils from './../clientUtils.js'

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      username: '',
      bannerText: 'Welcome to Top 10 Tweets!', 
      currentDisplay: 'welcome',
      loading: false,
      user: {},
      selected: [],
      random: [],
      stats: {
        frequency: [],
        sentiment: []
      }
    }
    this.bannerTexts = {
      welcome: 'Welcome to Top 10 Tweets!',
      selected: 'Top 10 Tweets',
      random: '10 Random Tweets',
      analysis: 'User Analysis'
    }
    this.setDisplay = this.setDisplay.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.clearInput = this.clearInput.bind(this)
    this.fetchTweets = this.fetchTweets.bind(this)
    this.updateResults = this.updateResults.bind(this)
  }

  setDisplay (section) {
    this.setState({
      bannerText: this.bannerTexts[section],
      currentDisplay: section
    })
  }

  handleInputChange (input) {
    this.setState({
      username: input
    })
  }

  clearInput () {
    this.setState({
      username: ''
    })
  }

  updateResults (results) {
    this.setState({
      user: results.selected[0].user,
      selected: results.selected,
      random: results.random,
      stats: results.stats,
      bannerText: this.bannerTexts.selected,
      currentDisplay: 'selected'
    })
  }

  fetchTweets (username, callback) {
    username = utils.cleanUsername(username, 15)
    if (username === '') {
      // TODO handle error
      console.log('Must enter a valid username')
    } else {
      request
      .post('/getTweets')
      .send({username: username})
      .end(function (err, res) {
        if (err) {
          console.log(err)
          // TODO handle error
        } else {
          callback(res.body)
        }
      })
    }
    this.clearInput()
  }

  componentDidMount () {
    document.addEventListener("keydown", function (e) {
      if (e.which === 13 || e.keyCode === 13) {
        e.preventDefault()
        this.fetchTweets(this.state.username, this.updateResults)
      }
    }.bind(this))
  }

  render () {
    return (
      <div>
        <Menu user={this.state.user} currentDisplay={this.state.currentDisplay} handleInputChange={this.handleInputChange} buttonSubmit={function () { this.fetchTweets(this.state.username, this.updateResults) }.bind(this)} username={this.state.username} />
        <Display bannerText={this.state.bannerText} currentDisplay={this.state.currentDisplay} setDisplay={this.setDisplay} selected={this.state.selected} random={this.state.random} analysis={this.state.analysis} />
      </div>
    )
  }
}
