/*
    ./client/components/App.jsx
*/
import React from 'react'
import Menu from './Menu.jsx'
import Display from './Display.jsx'
import request from 'superagent'
import utils from './../clientUtils.js'
import io from 'socket.io-client'

let socket = io()

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
      },
      socketID: '',
      loadingData: {}
    }
    this.bannerTexts = {
      welcome: 'Welcome to Top 10 Tweets!',
      selected: 'Top 10 Tweets',
      random: '10 Random Tweets',
      analysis: 'User Analysis',
      loading: 'Welcome to Top 10 Tweets!'
    }
    this.setDisplay = this.setDisplay.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.clearInput = this.clearInput.bind(this)
    this.fetchTweets = this.fetchTweets.bind(this)
    this.loadingUser = this.loadingUser.bind(this)
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

  fetchTweets (username, callback) {
    username = utils.cleanUsername(username, 15)
    if (username === '') {
      // TODO handle error
      console.log('Must enter a valid username')
    } else {
      this.setDisplay('loading')
      this.loadingUser(username)
      request
      .post('/getTweets')
      .send({username: username, socketID: socket.id})
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

  loadingUser (username) {
    const loading = 'loading...'
    this.setState({user: {
      id_str: '1',
      profile_image_url: '/loader.gif',
      profile_image_url_https: '/loader.gif',
      entities: {
        url: {
          urls: [{expanded_url: '#', display_url: loading}]
        }
      },
      name: loading,
      screen_name: loading,
      description: loading,
      location: loading,
      followers_count: 999999999,
      friends_count: 999999999
    }})
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

  componentDidMount () {
    document.addEventListener("keydown", function (e) {
      if (e.which === 13 || e.keyCode === 13) {
        e.preventDefault()
        this.fetchTweets(this.state.username, this.updateResults)
      }
    }.bind(this))
    socket.on('socketID', (data) => {
      console.log('Socket ID:', data)
      this.setState({socketID: data})
    })
    socket.on('userFound', (data) => {
      console.log('User Found:', data)
      this.setState({user: data.user})
    })
    socket.on('loadingData', (data) => {
      this.setState({loadingData: data})
    })
  }

  render () {
    return (
      <div>
        <Menu user={this.state.user} currentDisplay={this.state.currentDisplay} handleInputChange={this.handleInputChange} buttonSubmit={function () { this.fetchTweets(this.state.username, this.updateResults) }.bind(this)} username={this.state.username} />
        <Display bannerText={this.state.bannerText} loadingData={this.state.loadingData} currentDisplay={this.state.currentDisplay} setDisplay={this.setDisplay} selected={this.state.selected} random={this.state.random} analysis={this.state.analysis} />
      </div>
    )
  }
}
