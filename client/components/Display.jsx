import React from 'react'
import DisplayMenu from './DisplayMenu.jsx'
import WelcomePanel from './WelcomePanel.jsx'
import TweetList from './TweetList.jsx'

export default class Display extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      bannerText: 'Welcome to Top 10 Tweets!',
      currentDisplay: 'welcome'
    }
    this.bannerTexts = {
      welcome: 'Welcome to Top 10 Tweets!',
      selected: 'Top 10 Tweets',
      random: 'Random 10 Tweets',
      analysis: 'User Analysis'
    }
    this.setDisplay = this.setDisplay.bind(this)
  }

  setDisplay (section) {
    this.setState({
      bannerText: this.bannerTexts[section],
      currentDisplay: section
    })
  }

  renderDisplay (section) {
    if (section === 'welcome') {
      return <WelcomePanel />
    } else if (section === 'selected') {
      return <TweetList tweets={this.props.selected} />
    } else if (section === 'random') {
      return <TweetList tweets={this.props.random} />
    } else if (section === 'analysis') {
      return <h1>ANALYSIS</h1>
    }
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.selected.length > this.props.selected) {
      this.setDisplay('selected')
    } else if (nextProps.selected.length > 0 && this.props.selected.length > 0) {
      const nextSelectedId = nextProps.selected[0].id_str
      const prevSelectedId = this.props.selected[0].id_str
      const nextRandomId = nextProps.random[0].id_str
      const prevRandomId = this.props.random[0].id_str
      if (nextSelectedId === prevSelectedId || nextRandomId === prevRandomId) {
        this.setDisplay('selected')
      }
    }
  }

  render () {
    let display = this.renderDisplay(this.state.currentDisplay)
    return (
      <div id="displayContainer" className="col-md-8 panel-body">
        <DisplayMenu bannerText={this.state.bannerText} setDisplay={this.setDisplay} />
        {display}
      </div>
    )
  }
}
