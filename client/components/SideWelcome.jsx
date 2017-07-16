import React from 'react'

export default class SideWelcome extends React.Component {
  render () {
    return (
      <div className="panel-body">
        <div id="sidePanel" className="panel">
          <h4>
            Hi there!<br /><br />
            To get started, enter a user's twitter username above to begin analysis.<br /><br />
            Selected tweets will display on the right. A random selection of 10 tweets is available for comparison and information on the users's tweets can be found under 'User Analysis'.<br /><br />
            A chart of the user's monthly average sentiment and top 25 words can be found under 'User Analysis'.
          </h4>
        </div>
      </div>
    )
  }
}
