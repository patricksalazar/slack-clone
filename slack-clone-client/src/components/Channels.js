import React from 'react';
import styled from 'styled-components';
import { Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

const ChannelWrapper = styled.div`
  grid-column: 2;
  grid-row: 1 / 4;
  background-color: #4e3a4c;
  color: #958993;
`;

const NamedHeader = styled.h1`
  color: #fff;
  font-size: 20px;
`;

const SideBarList = styled.ul`
  width: 100%;
  list-style: none;
  padding-left: 0px;
`;

const paddingLeft = 'padding-left: 10px';

const SideBarListItem = styled.li`
  padding: 2px;
  ${paddingLeft};
  &:hover {
    background: #3e313c;
  }
`;

const SideBarListHeader = styled.li`
  ${paddingLeft}
  color: #fff;
  font-size: 18px;
`;

const PadLeft = styled.div`
  ${paddingLeft}
`;
const Green = styled.span`
  color: #38978d;
`;

const Bubble = ({ on = true }) => (on ? <Green>●</Green> : 'o');

const channel = ({ id, name }, teamId) => (
  <Link key={`channel-${id}`} to={`/view-team/${teamId}/${id}`}>
    <SideBarListItem># {name}</SideBarListItem>
  </Link>
);

const user = ({ id, name }) => (
  <SideBarListItem key={`user-${id}`}>
    <Bubble /> {name}
  </SideBarListItem>
);

export default ({
  teamId,
  teamName,
  username,
  channels,
  users,
  isOwner,
  onAddChannelClick,
  onInvitePeopleClick
}) => (
  <ChannelWrapper>
    <PadLeft>
      <NamedHeader>{teamName}</NamedHeader>
      {username}
    </PadLeft>
    <div>
      <SideBarList>
        <SideBarListHeader>
          Channels{' '}
          {isOwner && <Icon name="add circle" onClick={onAddChannelClick} />}
        </SideBarListHeader>
        {channels ? channels.map(c => channel(c, teamId)) : []}
      </SideBarList>
    </div>
    <div>
      <SideBarList>
        <SideBarListHeader>Direct Messages</SideBarListHeader>
        {users.map(user)}
      </SideBarList>
    </div>
    {isOwner && (
      <div>
        <a href="#invite-people" onClick={onInvitePeopleClick}>
          + Invite People
        </a>
      </div>
    )}
  </ChannelWrapper>
);
