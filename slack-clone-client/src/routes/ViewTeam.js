import React from 'react';
import { Redirect } from 'react-router-dom';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import findIndex from 'lodash/findIndex';
import * as compose from 'lodash.flowright';

import Sidebar from '../containers/Sidebar';
import MessageContainer from '../containers/MessageContainer';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AppLayout from '../components/AppLayout';

import { ME_QUERY } from '../graphql/team';

const SEND_MESSAGE = gql`
  mutation($channelId: Int!, $text: String!) {
    createMessage(channelId: $channelId, text: $text)
  }
`;

const ViewTeam = ({
  mutate,
  data: { loading, error, me },
  match: {
    params: { teamId, channelId }
  }
}) => {
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {JSON.stringify(error)}</p>;

  const { username, teams } = me;
  if (!teams.length) {
    return <Redirect to="/create-team" />;
  }

  let teamIdInteger = parseInt(teamId, 10);
  const teamIdx = teamIdInteger ? findIndex(teams, ['id', teamIdInteger]) : 0;
  const team = teamIdx === -1 ? teams[0] : teams[teamIdx];

  let channelIdInteger = parseInt(channelId, 10);
  const channelIdx = channelIdInteger
    ? findIndex(team.channels, ['id', channelIdInteger])
    : 0;
  const channel =
    channelIdx === -1 ? team.channels[0] : team.channels[channelIdx];

  return (
    <AppLayout>
      <Sidebar
        teams={teams.map(t => ({
          id: t.id,
          letter: t.name.charAt(0).toUpperCase()
        }))}
        team={team}
        username={username}
      />
      {channel && <Header channelName={channel.name} />}
      {channel && <MessageContainer channelId={channel.id} />}
      {channel && (
        <Footer
          channelId={channelId}
          placeholder={channel.name}
          onSubmit={async text => {
            return await mutate({ variables: { text, channelId: channel.id } });
          }}
        />
      )}
    </AppLayout>
  );
};

export default compose(
  graphql(ME_QUERY, { options: { fetchPolicy: 'network-only' } }),
  graphql(SEND_MESSAGE)
)(ViewTeam);
