import gql from 'graphql-tag';

export const ME_QUERY = gql`
  {
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
          dm
        }
      }
    }
  }
`;

export const GET_TEAM_MEMBERS = gql`
  query($teamId: Int!) {
    getTeamMembers(teamId: $teamId) {
      id
      username
    }
  }
`;
