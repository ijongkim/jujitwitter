import React from 'react'

export default class LoadingPanel extends React.Component {
  render () {
    return (
      <div>
        <h2>{this.props.loadingData.text}</h2>
        <div className="progress">
          <div className="progress-bar" role="progressbar" aria-valuenow={this.props.loadingData.progress} aria-valuemin="0" aria-valuemax="100" style={{width: `${this.props.loadingData.progress}%`}}>
            <span className="sr-only">{this.props.loadingData.progress}% Complete</span>
          </div>
        </div>
      </div>
    )
  }
}
