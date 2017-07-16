import React from 'react'

export default class SwitchButton extends React.Component {
  render (props) {
    const glyphs = {
      'selected': ['glyphicon glyphicon-search', ' Selected Tweets'],
      'random': ['glyphicon glyphicon-random', ' Random Tweets'],
      'analysis': ['glyphicon glyphicon-stats', ' User Analysis']
    }

    return (
      <div className="col-lg-4">
        <button type="button" className="btn btn-default btn-block">
          <span className={`${glyphs[this.props.option][0]}`} aria-hidden="true"></span>{`${glyphs[this.props.option][1]}`}
        </button>
      </div>
    )
  }
}
