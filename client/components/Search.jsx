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
              <input id="submitUser" type="text" className="form-control" id="exampleInputAmount" placeholder="username" />
            </div>
          </div>
          <button id="submitButton" type="button" className="btn btn-default btn-block">Get Tweets!</button>
        </form>
      </div>
    )
  }
}
