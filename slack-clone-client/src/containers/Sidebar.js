import React from 'react';

import Channels from '../components/Channels';
import Teams from '../components/Teams';
import AddChannelModal from '../components/AddChannelModal';
import InvitePeopleModal from '../components/InvitePeopleModal';

export default class Sidebar extends React.Component {
  state = {
    openAddChannelModal: false,
    openInvitePeopleModal: false
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

  render() {
    const { teams, team, username } = this.props;
    const { openAddChannelModal, openInvitePeopleModal } = this.state;

    console.log('team.channels: ' + JSON.stringify(team.channels));
    console.log('team.admin: ' + JSON.stringify(team.admin));

    return [
      <Teams key="teams-sidebar" teams={teams} />,
      <Channels
        key="channels-sidebar"
        teamId={team.id}
        teamName={team.name}
        username={username}
        isOwner={team.admin}
        channels={team.channels}
        users={[
          { id: 1, name: 'slackbot' },
          { id: 2, name: 'user1' }
        ]}
        onAddChannelClick={this.toggleAddChannelModal}
        onInvitePeopleClick={this.toggleInvitePeopleClick}
      />,
      <AddChannelModal
        teamId={team.id}
        open={openAddChannelModal}
        onClose={this.toggleAddChannelModal}
        key="sidebar-add-channel-modal"
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
