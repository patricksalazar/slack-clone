import React from 'react';
import {
  Header,
  Image,
  Menu,
  Segment,
  Sidebar,
  Label
} from 'semantic-ui-react';
import TeamHeader from './TeamHeader';
import MessageInput from '../MessageInput';

const TeamSidebar = ({ teamName, username, channelNames, privateChannels }) => (
  <Sidebar.Pushable as={Segment}>
    <Sidebar
      as={Menu}
      animation="overlay"
      icon="labeled"
      inverted
      vertical
      visible
      width="thin"
    >
      <Menu.Item as="a" name="team">
        <Label color="teal">1</Label>
        {teamName}
      </Menu.Item>
      <Menu.Item as="a">
        <Label color="teal">1</Label>
        {username}
      </Menu.Item>
      <Menu.Item as="a">Channels:</Menu.Item>
      {channelNames.map(cn => (
        <Menu.Item as="a">
          <Label color="teal">1</Label>
          {cn}
        </Menu.Item>
      ))}
      <Menu.Item as="a">
        <Label color="blue">20</Label>
        Private Channels
      </Menu.Item>
      {privateChannels.map(cn => (
        <Menu.Item as="a">{cn}</Menu.Item>
      ))}
    </Sidebar>

    <Sidebar.Pushable>
      <Segment basic style={{ 'padding-left': '260px' }}>
        <TeamHeader />
        <MessageInput />
        <Header as="h3">Application Content</Header>
        <Image src="/images/wireframe/paragraph.png" />
      </Segment>
    </Sidebar.Pushable>
  </Sidebar.Pushable>
);

export default TeamSidebar;
