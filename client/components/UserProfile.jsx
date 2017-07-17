import React from 'react'
import utils from './../clientUtils.js'

export default class UserProfile extends React.Component {
  render () {
    let user = this.props.user
    let profileImage = user.profile_image_url_https
    let profileImageBig = profileImage.replace(/_normal/g, '')
    profileImage = utils.imageExists(profileImageBig) ? profileImageBig : profileImage
    let urlInfo = user.entities.url ? user.entities.url.urls[0] : {expanded_url: '', display_url: ''}
    return (
      <div className="userPicAndStats row">
        <div className="col-xs-4">
          <img className="img-rounded userPic" src={profileImage} /></div>
          <div className="userStats col-xs-8">
            <h2>{user.name}</h2>
            <span dangerouslySetInnerHTML={{__html: utils.parseTweet('@' + user.screen_name, true)}}></span>
            <span className="glyphicon glyphicon-user" aria-hidden="true" /> {utils.parseTweet(user.description)}<br />
            <span className="glyphicon glyphicon-map-marker" aria-hidden="true" /> {user.location}<br />
            <span className="glyphicon glyphicon-bullhorn" aria-hidden="true" /> {utils.addCommas(user.followers_count)}<br />
            <span className="glyphicon glyphicon-search" aria-hidden="true" /> {utils.addCommas(user.friends_count)}<br />
            <span className="glyphicon glyphicon-globe" aria-hidden="true" /> <a href={urlInfo.expanded_url} target="_blank">{urlInfo.display_url}</a>
        </div>
      </div>
    )
  }
}