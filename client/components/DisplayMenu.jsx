import React from 'react'
import DisplayBanner from './DisplayBanner.jsx'
import MenuSwitches from './MenuSwitches.jsx'

export default class DisplayMenu extends React.Component {
  render () {
    return (
      <div>
        <DisplayBanner />
        <MenuSwitches />
      </div>
    )
  }
}
