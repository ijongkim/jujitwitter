import React from 'react'
import SwitchButton from './SwitchButton.jsx'

export default class MenuSwitches extends React.Component {
  render () {
    return (
      <div id="displayMenu">
        <div className="row">
          <SwitchButton option="selected" />
          <SwitchButton option="random" />
          <SwitchButton option="analysis" />
        </div>
      </div>
    )
  }
}
