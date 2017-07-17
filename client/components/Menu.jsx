import React from 'react'
import Search from './Search.jsx'
import SideWelcome from './SideWelcome.jsx'
import UserProfile from './UserProfile.jsx'

export default class Menu extends React.Component {
  constructor (props) {
    super(props)
    this.renderSidePanel = this.renderSidePanel.bind(this)
  }

  renderSidePanel (section) {
    if (section === 'loading') {
      // Loading Panel
    } else if (this.props.user.id_str) {
      return <UserProfile user={this.props.user} />
    } else {
      return <SideWelcome />
    }
  }

  render () {
    let sidePanel = this.renderSidePanel(this.props.currentDisplay)
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
