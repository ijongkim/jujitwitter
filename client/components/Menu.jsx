import React from 'react'
import Search from './Search.jsx'
import SideWelcome from './SideWelcome.jsx'
import UserProfile from './UserProfile.jsx'

export default class Menu extends React.Component {
  render () {
    let sidePanel = this.props.user.id_str ? <UserProfile user={this.props.user} /> : <SideWelcome />
    return (
      <div id="menuContainer" className="col-md-4">
        <Search handleInputChange={this.props.handleInputChange} buttonSubmit={this.props.buttonSubmit} username={this.props.username} />
        <div className="panel-body">
          <div id="sidePanel" className="panel">
            {sidePanel}
          </div>
        </div>
      </div>
    )
  }
}
