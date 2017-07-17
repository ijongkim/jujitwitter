import React from 'react'

export default class SwitchButton extends React.Component {
  render (props) {
    return (
      <div className="col-lg-4">
        <button onClick={this.props.setDisplay} type="button" className="btn btn-default btn-block">
          <span className={this.props.optionClass} aria-hidden="true"></span>{this.props.optionText}
        </button>
      </div>
    )
  }
}
