import formatErrors from '../utils/formatErrors';
import { requiresAuth } from '../utils/permissions';

export default {
  Mutation: {
    createChannel: requiresAuth.createResolver(
      async (parent, args, { models, user }) => {
        try {
          console.log("createChannel and team");
          const member = await models.Member.findOne(
            { where: { teamId: args.teamId, userId: user.id } },
            { raw: true }
          );
          if (!member.admin) {
            return {
              ok: false,
              errors: [
                {
                  path: 'name',
                  message: 'Only owners of the team can create channels.'
                }
              ]
            };
          }
          const channel = await models.Channel.create(args);
          return {
            ok: true,
            channel
          };
        } catch (err) {
          console.log(err);
          return {
            ok: false,
            errors: formatErrors(err, models)
          };
        }
      }
    )
  }
};
