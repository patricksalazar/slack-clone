import { ApolloClient } from 'apollo-client';
import { ApolloLink, split } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { onError } from 'apollo-link-error';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { getMainDefinition } from 'apollo-utilities';
// import createFileLink from './createFileLink';

const GRAPHQL_ENDPOINT = 'http://localhost:8080/graphql';
const WS_ENDPOINT = 'ws://localhost:8080/subscriptions';

const httpLink = createHttpLink({
  // const httpLink = createFileLink({
  uri: GRAPHQL_ENDPOINT,
  credentials: 'same-origin'
  // credentials: 'include',
  // headers: {
  //   'Content-Type': 'application/graphql'
  // }
});

const errorHandler = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, location, path }) =>
      console.log(
        `[GraphQL error]: Message ${message}, Location: ${location}, Path: ${path}`
      )
    );
  }
  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      'x-token': localStorage.getItem('token') || null,
      'x-refresh-token': localStorage.getItem('refreshToken') || null
    }
  }));

  return forward(operation);
});

const afterwareLink = new ApolloLink((operation, forward) => {
  return forward(operation).map(response => {
    const context = operation.getContext();
    const {
      response: { headers }
    } = context;

    if (headers) {
      const token = headers.get('x-token');
      const refreshToken = headers.get('x-refresh-token');

      if (token) localStorage.setItem('token', token);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    }

    return response;
  });
});

// const logoutLink = onError(({ networkError }) => {
//   if (networkError.statusCode === 401) logoutLink();
// })

// Create a Web Socket link
const wsLink = new WebSocketLink({
  uri: WS_ENDPOINT,
  options: {
    reconnect: true,
    connectionParams: {
      token: localStorage.getItem('token'),
      refreshToken: localStorage.getItem('refreshToken')
    }
  }
});

// using the ability to split links, you can send data to each link
// depending on what kind of operation is being sent
const link = split(
  // split based on operation type
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  ApolloLink.from([errorHandler, authMiddleware, afterwareLink, httpLink])
);

export default new ApolloClient({
  link,
  cache: new InMemoryCache()
});
