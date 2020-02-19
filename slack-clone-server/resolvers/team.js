import { formatErrors } from '../utils/formatErrors';
import { requiresAuth } from '../utils/permissions';

export default {
  Query: {
    allTeams: requiresAuth.createResolver(
      async (parent, args, { models, user }) =>
        models.Team.findAll({ where: { owner: user.id } }, { raw: true })
    ),
    inviteTeams: requiresAuth.createResolver(
      async (parent, args, { models, user }) =>
        models.sequelize.query(
          'select teams.* from teams inner join members on id = team_id where user_id = ?',
          { replacements: [user.id], model: models.Team }
        )
    )
  },
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
          const teamPromise = models.Team.findOne(
            { where: { id: teamId } },
            { raw: true }
          );
          const userToAddPromise = models.User.findOne(
            { where: { email } },
            { raw: true }
          );
          const [team, userToAdd] = await Promise.all([
            teamPromise,
            userToAddPromise
          ]);
          console.log('team:' + JSON.stringify(team));
          console.log('userToAdd:' + JSON.stringify(userToAdd));

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
          if (team.owner !== user.id) {
            return {
              ok: false,
              errors: [
                {
                  path: 'email',
                  message: 'Must be an owner to add members to the team.'
                }
              ]
            };
          }
          await models.Member.create({ userId: userToAdd.id, teamId: team.id });
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
