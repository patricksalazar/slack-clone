import { withFilter } from 'apollo-server-express';
import { requiresAuth, directMessageSubscription } from '../utils/permissions';
import pubsub from '../utils/pubsub';

const NEW_DIRECT_MESSAGE = 'NEW_DIRECT_MESSAGE';

export default {
  Subscription: {
    newDirectMessage: {
      subscribe: directMessageSubscription.createResolver(
        withFilter(
          () => pubsub.asyncIterator(NEW_DIRECT_MESSAGE),
          (payload, args, { user }) =>
            payload.teamId === args.teamId &&
            ((payload.senderId === user.id &&
              payload.receiverId === args.userId) ||
              (payload.senderId === args.userId &&
                payload.receiverId === user.id))
        )
      )
    }
  },
  Query: {
    directMessages: requiresAuth.createResolver(
      async (parent, { teamId, otherUserId }, { models, user }) => {
        return models.DirectMessage.findAll(
          {
            where: {
              teamId,
              [models.Sequelize.Op.or]: [
                {
                  [models.Sequelize.Op.and]: [
                    { senderId: otherUserId, receiverId: user.id }
                  ]
                },
                {
                  [models.Sequelize.Op.and]: [
                    { senderId: user.id, receiverId: otherUserId }
                  ]
                }
              ]
            },
            order: [['createdAt', 'ASC']]
          },
          { raw: true }
        );
      }
    )
  },
  Mutation: {
    createDirectMessage: requiresAuth.createResolver(
      async (parent, args, { models, user }) => {
        try {
          const directMessage = await models.DirectMessage.create({
            ...args,
            senderId: user.id
          });

          pubsub.publish(NEW_DIRECT_MESSAGE, {
            teamId: args.teamId,
            receiverId: args.receiverId,
            senderId: user.id,
            newDirectMessage: {
              ...directMessage.dataValues,
              sender: {
                username: user.username
              }
            }
          });

          return true;
        } catch (err) {
          console.log(err);
          return false;
        }
      }
    )
  },
  DirectMessage: {
    sender: ({ sender, senderId }, args, { models }) => {
      if (sender) {
        return sender;
      }

      return models.User.findOne({ where: { id: senderId } }, { raw: true });
    }
  }
};
