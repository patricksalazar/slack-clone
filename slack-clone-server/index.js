import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { makeExecutableSchema } from 'graphql-tools';
import path from 'path';
import { fileLoader, mergeTypes, mergeResolvers } from 'merge-graphql-schemas';
import cors from 'cors';
import { createServer } from 'http';
import { execute, subscribe } from 'graphql';
import { SubscriptionServer } from 'subscriptions-transport-ws';

import models from './models';
import { findUser, refreshTokens } from './auth';

const SECRET = 'asjkdfhlkjhiouyqwer';
const SECRET2 = 'qweiuojsdguylkj';

const typeDefs = mergeTypes(fileLoader(path.join(__dirname, './schema')));
const resolvers = mergeResolvers(
  fileLoader(path.join(__dirname, './resolvers'))
);
const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();
app.use(cors('*'));

const addUser = async (req, res, next) => {
  const token = req.headers['x-token'];
  console.log('x-token:' + token);
  if (token) {
    try {
      req.user = findUser(token, SECRET);
    } catch (err) {
      const refreshToken = req.headers['x-refresh-token'];
      await refreshTokens(refreshToken, models, SECRET, SECRET2)
        .then(newTokens => {
          if (newTokens.token && newTokens.refreshToken) {
            res.set(
              'Access-Control-Expose-Headers',
              'x-token, x-refresh-token'
            );
            res.set('x-token', newTokens.token);
            res.set('x-refresh-token', newTokens.refreshToken);
          }
          req.user = newTokens.user;
        })
        .catch(err => {
          console.log('refreshToken: ' + refreshToken);
          console.log('Error in get token: ' + JSON.stringify(err));
        });
    }
  }
  next();
};
app.use(addUser);

const SERVER = new ApolloServer({
  typeDefs: typeDefs,
  resolvers: resolvers,
  context: async ({ req, connection }) => {
    if (connection) {
      console.log('Connection: ' + connection);
      return {
        models,
        user: connection.context,
        SECRET,
        SECRET2
      };
    } else {
      return {
        models,
        user: req.user,
        SECRET,
        SECRET2
      };
    }
  },
  playground: {
    endpoint: `http://localhost:8080/graphql`,
    subscriptionEndpoint: `ws:/localhost:8080/subscriptions`,
    settings: {
      'editor.theme': 'light'
    }
  }
});

SERVER.applyMiddleware({
  app,
  path: '/graphql',
  cors: true,
  bodyParserConfig: true
});

// const url = 'http:/localhost:8080/graphql';
// const subscriptionUrl = 'ws:/localhost:8080/subscriptions';
// SERVER.listen().then(({ url, subscriptionUrl }) => {
//   console.log(`🚀 Server ready at ${url}`);
//   console.log(`🚀 Subscriptions ready at ${subscriptionUrl}`);
// });

const server = createServer(app);

models.sequelize.sync({}).then(() => {
  server.listen(8080, () => {
    // eslint-disable-next-line no-new
    new SubscriptionServer(
      {
        execute,
        subscribe,
        schema,
        onConnect: async ({ token, refreshToken }, webSocket) => {
          if (token && refreshToken) {
            let user = null;
            try {
              user = findUser(token, SECRET);
            } catch (err) {
              await refreshTokens(refreshToken, models, SECRET, SECRET2)
                .then(newTokens => {
                  user = newTokens.user;
                })
                .catch(err => {
                  console.log('token: ' + token + ', refresh: ' + refreshToken);
                  console.log('Error in get token: ' + JSON.stringify(err));
                });
            }
            return { models, user };
          }
          return {};
        }
      },
      {
        server,
        path: '/subscriptions'
      }
    );
  });
});

// Exports
export default app;
