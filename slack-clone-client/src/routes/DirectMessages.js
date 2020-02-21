import React from 'react';
import { Redirect } from 'react-router-dom';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import findIndex from 'lodash/findIndex';
import * as compose from 'lodash.flowright';

import Sidebar from '../containers/Sidebar';
// import MessageContainer from '../containers/MessageContainer';
// import Header from '../components/Header';
import Footer from '../components/Footer';
import AppLayout from '../components/AppLayout';

import { ME_QUERY } from '../graphql/team';

const SEND_MESSAGE = gql`
  mutation($channelId: Int!, $text: String!) {
    createMessage(channelId: $channelId, text: $text)
  }
`;

const DirectMessages = ({
  data: { loading, error, me },
  match: {
    params: { teamId, userId }
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
      {/* <Header channelName={channel.name} />
      <MessageContainer channelId={channel.id} /> */}
      {/* <Footer channelId={channel.id} channelName={channel.name} /> */}
      <Footer onSubmit={() => {}} placeholder={userId} />
    </AppLayout>
  );
};

export default compose(
  graphql(ME_QUERY, { options: { fetchPolicy: 'network-only' } }),
  graphql(SEND_MESSAGE)
)(DirectMessages);
