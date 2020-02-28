import React from 'react';
import { Redirect } from 'react-router-dom';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import findIndex from 'lodash/findIndex';
import * as compose from 'lodash.flowright';

import Sidebar from '../containers/Sidebar';
import DirectMessageContainer from '../containers/DirectMessageContainer';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AppLayout from '../components/AppLayout';

import { ME_QUERY } from '../graphql/team';

const CREATE_DIRECT_MESSAGE = gql`
  mutation($receiverId: Int!, $teamId: Int!, $text: String!) {
    createDirectMessage(receiverId: $receiverId, teamId: $teamId, text: $text)
  }
`;

const DIRECT_MESSAGES_QUERY = gql`
  query($userId: Int!) {
    getUser(userId: $userId) {
      username
    }
    me {
      id
      username
      email
      teams {
        id
        name
        admin
        directMessageMembers {
          id
          username
        }
        channels {
          id
          name
        }
      }
    }
  }
`;

const DirectMessages = ({
  mutate,
  data: { loading, error, me, getUser },
  match: {
    params: { teamId, userId }
  }
}) => {
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {JSON.stringify(error)}</p>;
  console.log('Direct Messages');

  const { username, teams } = me;
  if (!teams.length) {
    return <Redirect to="/create-team" />;
  }

  let teamIdInteger = parseInt(teamId, 10);
  const teamIdx = teamIdInteger ? findIndex(teams, ['id', teamIdInteger]) : 0;
  const team = teamIdx === -1 ? teams[0] : teams[teamIdx];

  let userIdInteger = parseInt(userId, 10);
  console.log('userIdInteger: ' + userIdInteger);
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
      <Header channelName={getUser.username} />
      <DirectMessageContainer teamId={team.id} userId={userIdInteger} />
      <Footer
        onSubmit={async text => {
          const response = await mutate({
            variables: {
              text,
              receiverId: userIdInteger,
              teamId: teamIdInteger
            },
            optimisticResponse: {
              createDirectMessage: true
            },
            update: store => {
              const data = store.readQuery({ query: ME_QUERY });
              let teamIdx2 = findIndex(data.me.teams, ['id', team.id]);
              const notAlreadyThere = data.me.teams[
                teamIdx2
              ].directMessageMembers.every(
                member => member.id !== userIdInteger
              );
              if (notAlreadyThere) {
                console.log('Add Direct User: ' + userId);
                data.me.teams[teamIdx2].directMessageMembers.push({
                  __typename: 'User',
                  id: userIdInteger,
                  username: getUser.username
                });
                store.writeQuery({
                  query: ME_QUERY,
                  data
                });
              }
            }
          });
          console.log('response: ' + JSON.stringify(response));
        }}
        placeholder={userId}
      />
    </AppLayout>
  );
};

export default compose(
  graphql(DIRECT_MESSAGES_QUERY, {
    options: props => ({
      variables: { userId: parseInt(props.match.params.userId, 10) },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(CREATE_DIRECT_MESSAGE)
)(DirectMessages);
