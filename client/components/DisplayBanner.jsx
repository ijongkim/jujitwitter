import React from 'react'

export default class DisplayBanner extends React.Component {
  render () {
    return (
      <div id="displayBanner" className="tweetContainer panel">
        <span>{this.props.bannerText}</span>
      </div>
    )
  }
}
