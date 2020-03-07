import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { Container, Header, Menu } from 'semantic-ui-react';

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

  return (
    <Container text>
      <Header as="h2">Main Page</Header>
      <Menu>
        <Menu.Item name="login">
          <Link key={`menu-login`} to={`/login`}>
            Login
          </Link>
        </Menu.Item>
        <Menu.Item name="Register">
          <Link key={`menu-register`} to={`/register`}>
            Register
          </Link>
        </Menu.Item>
      </Menu>
      {data.allUsers.map(row => (
        <h1 key={row.id}>{row.email}</h1>
      ))}
    </Container>
  );
}

export default Home;
