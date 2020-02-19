import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import {
  Container,
  Header,
  Form,
  Input,
  Button,
  Message
} from 'semantic-ui-react';

const REGISTER = gql`
  mutation($username: String!, $email: String!, $password: String!) {
    register(username: $username, email: $email, password: $password) {
      ok
      errors {
        path
        message
      }
    }
  }
`;

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  let [usernameError, emailError, passwordError] = '';
  const errorList = [];

  const [register, { loading, data }] = useMutation(REGISTER, {
    variables: { username, email, password },
    refetchQueries: ['']
  });

  if (loading) {
    console.log('Loading: ' + JSON.stringify(loading));
    [usernameError, emailError, passwordError] = '';
  }
  if (data && data.register && data.register.ok) {
    console.log('Success');
    return <Redirect to="/" />;
  } else if (data && data.register && !data.register.ok) {
    const errors = data.register.errors;
    if (errors) {
      for (const [idx, { path, message }] of errors.entries()) {
        if (idx > errors.length) break;
        if (path === 'username') {
          usernameError = message;
        } else if (path === 'email') {
          emailError = message;
        } else if (path === 'password') {
          passwordError = message;
        }
        errorList.push(message);
      }
    }
  }
  // console.log(register);

  return (
    <Container text>
      <Header as="h2">Register</Header>
      <Form>
        <Form.Field error={!!usernameError}>
          <Input
            name="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Username"
            fluid
          />
        </Form.Field>
        <Form.Field error={!!emailError}>
          <Input
            name="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            fluid
          />
        </Form.Field>
        <Form.Field error={!!passwordError}>
          <Input
            name="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            fluid
          />
        </Form.Field>
        <Button onClick={register}>Submit</Button>
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

export default Register;
