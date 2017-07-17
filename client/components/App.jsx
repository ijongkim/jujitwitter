/*
    ./client/components/App.jsx
*/
import React from 'react'
import Menu from './Menu.jsx'
import Display from './Display.jsx'
import request from 'superagent'

export default class App extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      username: '',
      selected: [],
      random: [],
      stats: {
        frequency: [],
        sentiment: []
      },
      loading: false
    }
    this.fetchTweets = this.fetchTweets.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.clearInput = this.clearInput.bind(this)
    this.updateResults = this.updateResults.bind(this)
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
      selected: results.selected,
      random: results.random,
      stats: results.stats
    })
  }

  fetchTweets (username, callback) {
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
        <Menu handleInputChange={this.handleInputChange} buttonSubmit={function () { this.fetchTweets(this.state.username, this.updateResults) }.bind(this)} username={this.state.username} />
        <Display selected={this.state.selected} random={this.state.random} analysis={this.state.analysis} />
      </div>
    )
  }
}
