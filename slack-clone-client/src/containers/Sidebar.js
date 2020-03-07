import React from 'react';

import Channels from '../components/Channels';
import Teams from '../components/Teams';
import AddChannelModal from '../components/AddChannelModal';
import InvitePeopleModal from '../components/InvitePeopleModal';
import DirectMessageModal from '../components/DirectMessageModal';

export default class Sidebar extends React.Component {
  state = {
    openAddChannelModal: false,
    openInvitePeopleModal: false,
    openDirectMessageModal: false
  };

  toggleAddChannelModal = e => {
    if (e) e.preventDefault();
    this.setState(state => ({
      openAddChannelModal: !state.openAddChannelModal
    }));
  };

  toggleInvitePeopleClick = e => {
    if (e) e.preventDefault();
    this.setState(state => ({
      openInvitePeopleModal: !state.openInvitePeopleModal
    }));
  };

  toggleDirectMessageClick = e => {
    if (e) e.preventDefault();
    this.setState(state => ({
      openDirectMessageModal: !state.openDirectMessageModal
    }));
  };

  render() {
    const { teams, team, username, currentUserId } = this.props;
    const {
      openAddChannelModal,
      openInvitePeopleModal,
      openDirectMessageModal
    } = this.state;

    const regularChannels = [];
    const dmChannels = [];
    team.channels.forEach(c => {
      if (c.dm) {
        dmChannels.push(c);
      } else {
        regularChannels.push(c);
      }
    });

    return [
      <Teams key="teams-sidebar" teams={teams} />,
      <Channels
        key="channels-sidebar"
        teamId={team.id}
        teamName={team.name}
        username={username}
        isOwner={team.admin}
        channels={regularChannels}
        dmChannels={dmChannels}
        onAddChannelClick={this.toggleAddChannelModal}
        onInvitePeopleClick={this.toggleInvitePeopleClick}
        onDirectMessageClick={this.toggleDirectMessageClick}
      />,
      <AddChannelModal
        teamId={team.id}
        currentUserId={currentUserId}
        open={openAddChannelModal}
        onClose={this.toggleAddChannelModal}
        key="sidebar-add-channel-modal"
      />,
      <DirectMessageModal
        teamId={team.id}
        currentUserId={currentUserId}
        open={openDirectMessageModal}
        onClose={this.toggleDirectMessageClick}
        key="sidebar-direct-message-modal"
      />,
      <InvitePeopleModal
        teamId={team.id}
        open={openInvitePeopleModal}
        onClose={this.toggleInvitePeopleClick}
        key="sidebar-invite-people-modal"
      />
    ];
  }
}
