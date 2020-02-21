// import { PubSub, withFilter } from 'apollo-server-express';
import { requiresAuth, requiresTeamAccess } from '../utils/permissions';

// const pubsub = new PubSub();

// const NEW_CHANNEL_MESSAGE = 'NEW_CHANNEL_MESSAGE';

export default {
  // Subscription: {
  //   newChannelMessage: {
  //     subscribe: requiresTeamAccess.createResolver(
  //       withFilter(
  //         () => pubsub.asyncIterator(NEW_CHANNEL_MESSAGE),
  //         (payload, args) => payload.channelId === args.channelId
  //       )
  //     )
  //   }
  // },
  Query: {
    directMessages: requiresAuth.createResolver(
      async (parent, { teamId, otherUserId }, { models, user }) => {
        return models.DirectMessage.findAll(
          {
            where: {
              teamId,
              [models.sequelize.Op.or]: [
                {
                  [models.sequelize.Op.and]: [
                    { senderId: otherUserId, receiverId: userid }
                  ]
                },
                {
                  [models.sequelize.Op.and]: [
                    { senderId: userid, receiverId: otherUserId }
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

          // const asyncFunc = async () => {
          //   const currentUser = await models.User.findOne({
          //     where: {
          //       id: user.id
          //     }
          //   });

          //   pubsub.publish(NEW_CHANNEL_MESSAGE, {
          //     channelId: args.channelId,
          //     newChannelMessage: {
          //       ...message.dataValues,
          //       user: currentUser.dataValues
          //     }
          //   });
          // };

          // asyncFunc();

          return true;
        } catch (err) {
          console.log(err);
          return false;
        }
      }
    )
  },
  DirectMessage: {
    sender: ({ user, userId }, args, { models }) => {
      if (user) {
        return user;
      }

      return models.User.findOne({ where: { id: userId } }, { raw: true });
    }
  }
};
