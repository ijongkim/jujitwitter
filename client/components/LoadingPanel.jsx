import React from 'react'

export default class LoadingPanel extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      message: 'Fetching tweets...',
      progress: 5
    }
    this.updateProgress = this.updateProgress.bind(this)
  }

  updateProgress (complete) {
    const messages = {
      fetching: `Received ${complete.count} tweets...`,
      processing: `Processing ${complete.count} tweets...`,
      scoring: `Scoring tweets...`,
      sending: `Almost finished...`
    }
    this.setState({
      message: messages[complete.state],
      progress: complete.progress
    })
  }

  render () {
    return (
      <div className="progress">
        <div className="progress-bar" role="progressbar" aria-valuenow={this.state.progress} aria-valuemin="0" aria-valuemax="100" style={{width: `${this.state.progress}%`}}>
          <span className="sr-only">{this.state.progress}% Complete</span>
        </div>
      </div>
    )
  }
}
