/*
    ./client/components/App.jsx
*/
import React from 'react'
import Menu from './Menu.jsx'
import Display from './Display.jsx'

export default class App extends React.Component {
  render () {
    return (
      <div>
        <Menu />
        <Display />
      </div>
    )
  }
}
