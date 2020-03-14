import { withFilter } from 'apollo-server-express';
import * as moment from 'moment';
import { requiresAuth, requiresTeamAccess } from '../utils/permissions';

import pubsub from '../utils/pubsub';

const NEW_CHANNEL_MESSAGE = 'NEW_CHANNEL_MESSAGE';

export default {
  Subscription: {
    newChannelMessage: {
      subscribe: requiresTeamAccess.createResolver(
        withFilter(
          () => pubsub.asyncIterator(NEW_CHANNEL_MESSAGE),
          (payload, args) => payload.channelId === args.channelId
        )
      )
    }
  },
  Query: {
    messages: requiresAuth.createResolver(
      async (parent, { channelId, cursor }, { models, user }) => {
        const channel = await models.Channel.findOne({
          raw: true,
          where: { id: channelId }
        });

        if (!channel.public) {
          const member = await models.PCMember.findOne({
            raw: true,
            where: { channelId, userId: user.id }
          });
          if (!member) {
            throw new Error('Not Authorized');
          }
        }

        const options = {
          where: { channelId },
          order: [['createdAt', 'DESC']],
          limit: models.DEFAULT_LIMIT
        };

        if (cursor) {
          console.log('cursor: ' + cursor);
          options.where.created_at = {
            [models.op.lt]: moment.unix(cursor / 1000)
          };
        }

        return models.Message.findAll(options, { raw: true });
      }
    )
  },
  Mutation: {
    createMessage: requiresAuth.createResolver(
      async (parent, { file, ...args }, { models, user }) => {
        try {
          const messageData = args;
          if (file) {
            messageData.filetype = file.type;
            messageData.url = file.path;
          }
          const message = await models.Message.create({
            ...messageData,
            userId: user.id
          });
          console.log(
            'message createdAt: ' + moment.unix(message.createdAt).format()
          );

          const asyncFunc = async () => {
            const currentUser = await models.User.findOne({
              where: {
                id: user.id
              }
            });

            pubsub.publish(NEW_CHANNEL_MESSAGE, {
              channelId: args.channelId,
              newChannelMessage: {
                ...message.dataValues,
                user: currentUser.dataValues
              }
            });
          };

          asyncFunc();

          return true;
        } catch (err) {
          console.log(err);
          return false;
        }
      }
    )
  },
  Message: {
    url: parent => {
      return parent.url
        ? `${process.env.SERVER_URL || 'http://localhost:8080'}/${parent.url}`
        : parent.url;
    },
    user: ({ user, userId }, args, { userLoader }) => {
      if (user) {
        return user;
      }

      return userLoader.load(userId);
    }
  }
};
