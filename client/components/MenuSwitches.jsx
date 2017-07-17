import React from 'react'
import SwitchButton from './SwitchButton.jsx'

export default class MenuSwitches extends React.Component {
  constructor (props) {
    super(props)
    this.glyphs = {
      'selected': ['glyphicon glyphicon-search', ' Selected Tweets'],
      'random': ['glyphicon glyphicon-random', ' Random Tweets'],
      'analysis': ['glyphicon glyphicon-stats', ' User Analysis']
    }
  }

  render () {
    return (
      <div id="displayMenu">
        <div className="row">
          <SwitchButton optionClass={`${this.glyphs.selected[0]}`} optionText={`${this.glyphs.selected[1]}`} setDisplay={function () { this.props.setDisplay('selected') }.bind(this)} />
          <SwitchButton optionClass={`${this.glyphs.random[0]}`} optionText={`${this.glyphs.random[1]}`} setDisplay={function () { this.props.setDisplay('random') }.bind(this)} />
          <SwitchButton optionClass={`${this.glyphs.analysis[0]}`} optionText={`${this.glyphs.analysis[1]}`} setDisplay={function () { this.props.setDisplay('analysis') }.bind(this)} />
        </div>
      </div>
    )
  }
}
