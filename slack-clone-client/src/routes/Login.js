import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import gql from 'graphql-tag';
import { useMutation } from '@apollo/react-hooks';
import {
  Container,
  Header,
  Form,
  Input,
  Button,
  Message
} from 'semantic-ui-react';

import { wsLink } from '../apollo';

const LOGIN = gql`
  mutation($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      ok
      token
      refreshToken
      errors {
        path
        message
      }
    }
  }
`;

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  let [emailError, passwordError] = '';
  const errorList = [];

  const [login, { loading, data }] = useMutation(LOGIN, {
    variables: { email, password },
    refetchQueries: ['']
  });

  if (loading) {
    [emailError, passwordError] = '';
  }

  if (data && data.login && data.login.ok) {
    const { ok, token, refreshToken } = data.login;
    if (ok) {
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      wsLink.subscriptionClient.tryReconnect();
    }
    return <Redirect to="/view-team" />;
  } else if (data && data.login && !data.login.ok) {
    const errors = data.login.errors;
    if (errors) {
      for (const [idx, { path, message }] of errors.entries()) {
        if (idx > errors.length) break;
        if (path === 'email') {
          emailError = message;
        } else if (path === 'password') {
          passwordError = message;
        }
        errorList.push(message);
      }
    }
  }

  return (
    <Container text>
      <Header as="h2">Login</Header>
      <Form>
        <Form.Field error={!!emailError}>
          <Input
            name="email"
            value={email}
            autoComplete="username"
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
            autoComplete="current-password"
            placeholder="Password"
            fluid
          />
        </Form.Field>
        <Button onClick={login}>Submit</Button>
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

export default Login;
