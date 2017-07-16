import React from 'react'
import Search from './Search.jsx'
import SideWelcome from './SideWelcome.jsx'

export default class Menu extends React.Component {
  render () {
    return (
      <div id="menuContainer" className="col-md-4">
        <Search />
        <SideWelcome />
      </div>
    )
  }
}
