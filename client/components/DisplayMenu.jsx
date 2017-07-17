import React from 'react'
import DisplayBanner from './DisplayBanner.jsx'
import MenuSwitches from './MenuSwitches.jsx'

export default class DisplayMenu extends React.Component {
  render () {
    return (
      <div>
        <DisplayBanner bannerText={this.props.bannerText} />
        <MenuSwitches allowSwitch={this.props.allowSwitch} setDisplay={this.props.setDisplay} />
      </div>
    )
  }
}
