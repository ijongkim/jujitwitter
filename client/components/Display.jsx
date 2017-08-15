import React from 'react'
import DisplayMenu from './DisplayMenu.jsx'
import WelcomePanel from './WelcomePanel.jsx'
import TweetList from './TweetList.jsx'
import LoadingPanel from './LoadingPanel.jsx'
import ChartDisplay from './ChartDisplay.jsx'

export default class Display extends React.Component {
  renderDisplay (section) {
    if (section === 'welcome') {
      return <WelcomePanel />
    } else if (section === 'selected') {
      return <TweetList tweets={this.props.selected} />
    } else if (section === 'random') {
      return <TweetList tweets={this.props.random} />
    } else if (section === 'analysis') {
      return <ChartDisplay stats={this.props.stats} />
    } else if (section === 'loading') {
      return <LoadingPanel loadingData={this.props.loadingData} />
    }
  }

  render () {
    let display = this.renderDisplay(this.props.currentDisplay)
    return (
      <div id="displayContainer" className="col-md-8 panel-body">
        <DisplayMenu allowSwitch={this.props.selected.length > 0} bannerText={this.props.bannerText} setDisplay={this.props.setDisplay} />
        {display}
      </div>
    )
  }
}
