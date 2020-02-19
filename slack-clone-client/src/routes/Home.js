import React from 'react';
import { gql } from 'apollo-boost';
import { useQuery } from '@apollo/react-hooks';

const ALL_USERS = gql`
  {
    allUsers {
      id
      username
      email
    }
  }
`;

function Home() {
  const { loading, error, data } = useQuery(ALL_USERS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {JSON.stringify(error)}</p>;

  return data.allUsers.map(row => <h1 key={row.id}>{row.email}</h1>);
}

export default Home;
