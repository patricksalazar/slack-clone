import { formatErrors } from '../utils/formatErrors';
import { requiresAuth } from '../utils/permissions';

export default {
  Mutation: {
    createTeam: requiresAuth.createResolver(
      async (parent, args, { models, user }) => {
        try {
          const response = await models.sequelize.transaction(async () => {
            const team = await models.Team.create({ ...args, owner: user.id });
            // Not awaiting Channel not required
            await models.Channel.create({
              name: 'general',
              teamId: team.id,
              public: true
            });
            await models.Member.create({
              teamId: team.id,
              userId: user.id,
              admin: true
            });
            return team;
          });
          return {
            ok: true,
            team: response
          };
        } catch (err) {
          console.log(err);
          return {
            ok: false,
            errors: formatErrors(err, models)
          };
        }
      }
    ),
    addTeamMember: requiresAuth.createResolver(
      async (parent, { email, teamId }, { models, user }) => {
        try {
          const memberPromise = models.Member.findOne(
            { where: { teamId, userId: user.id } },
            { raw: true }
          );
          const userToAddPromise = models.User.findOne(
            { where: { email } },
            { raw: true }
          );
          const [member, userToAdd] = await Promise.all([
            memberPromise,
            userToAddPromise
          ]);
          console.log('member:' + JSON.stringify(member));
          console.log('userToAdd:' + JSON.stringify(userToAdd));

          if (!member.admin) {
            return {
              ok: false,
              errors: [
                {
                  path: 'email',
                  message: 'You cannot add members to the team.'
                }
              ]
            };
          }
          if (!userToAdd) {
            return {
              ok: false,
              errors: [
                {
                  path: 'email',
                  message: 'User not found for this email.'
                }
              ]
            };
          }
          await models.Member.create({ userId: userToAdd.id, teamId });
          return {
            ok: true
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
  },
  Team: {
    channels: (parent, args, { models }) =>
      models.Channel.findAll({ where: { teamId: parent.id } })
  }
};
