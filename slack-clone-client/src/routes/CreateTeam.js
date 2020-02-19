import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import {
  Container,
  Header,
  Form,
  Input,
  Button,
  Message
} from 'semantic-ui-react';
import { gql } from 'apollo-boost';
import { useMutation } from '@apollo/react-hooks';

const CREATE_TEAM = gql`
  mutation($name: String!) {
    createTeam(name: $name) {
      ok
      team {
        id
      }
      errors {
        path
        message
      }
    }
  }
`;

function CreateTeam() {
  const [name, setName] = useState('');
  let nameError = '';
  const errorList = [];

  const [createTeam, { loading, error, data }] = useMutation(CREATE_TEAM, {
    variables: { name },
    refetchQueries: ['']
  });

  if (loading) {
    console.log('Loading: ' + JSON.stringify(loading));
    [nameError] = '';
  }
  if (error) {
    console.log('Error: ' + JSON.stringify(error));
    return error;
  }
  if (data && data.createTeam && data.createTeam.ok) {
    console.log('Success');
    return <Redirect to={`/view-team/${data.createTeam.team.id}`} />;
  } else if (data && data.createTeam && !data.createTeam.ok) {
    const errors = data.createTeam.errors;
    if (errors) {
      for (const [idx, { path, message }] of errors.entries()) {
        if (idx > errors.length) break;
        if (path === 'name') {
          nameError = message;
        }
        errorList.push(message);
      }
    }
  }
  // console.log(register);

  return (
    <Container text>
      <Header as="h2">Create Team</Header>
      <Form>
        <Form.Field error={!!nameError}>
          <Input
            name="name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Name"
            fluid
          />
        </Form.Field>
        <Button onClick={createTeam}>Submit</Button>
      </Form>
      {errorList.length ? (
        <Message
          error
          header="An error occurred with your submission"
          list={errorList}
        />
      ) : null}
    </Container>
  );
}

export default CreateTeam;
