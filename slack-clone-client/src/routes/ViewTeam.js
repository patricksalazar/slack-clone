import React from 'react';
import { Redirect } from 'react-router-dom';
import { graphql } from 'react-apollo';
import findIndex from 'lodash/findIndex';

import Sidebar from '../containers/Sidebar';
import MessageContainer from '../containers/MessageContainer';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AppLayout from '../components/AppLayout';

import { ALL_TEAMS } from '../graphql/team';

const ViewTeam = ({
  data: { loading, error, allTeams, inviteTeams },
  match: {
    params: { teamId, channelId }
  }
}) => {
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {JSON.stringify(error)}</p>;

  const teams = [...allTeams, ...inviteTeams];

  if (!teams.length) {
    return <Redirect to="/create-team" />;
  }
  console.log(inviteTeams);

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
      />
      {channel && <Header channelName={channel.name} />}
      {channel && <MessageContainer channelId={channel.id} />}
      {channel && <Footer channelId={channel.id} channelName={channel.name} />}
    </AppLayout>
  );
};

export default graphql(ALL_TEAMS)(ViewTeam);
