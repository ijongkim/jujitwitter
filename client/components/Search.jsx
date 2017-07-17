/*
    ./client/components/Search.jsx
*/
import React from 'react'

export default class Search extends React.Component {
  render () {
    return (
      <div className="panel-body">
        <form>
          <div className="form-group">
            <div className="input-group">
              <div className="input-group-addon">@</div>
              <input id="submitUser" type="text" className="form-control" placeholder="username" value={this.props.username} onChange={function (e) { this.props.handleInputChange(e.target.value) }.bind(this)} />
            </div>
          </div>
          <button onClick={this.props.buttonSubmit} id="submitButton" type="button" className="btn btn-default btn-block">Get Tweets!</button>
        </form>
      </div>
    )
  }
}
