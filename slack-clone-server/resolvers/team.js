import { formatErrors } from '../utils/formatErrors';
import { requiresAuth } from '../utils/permissions';

export default {
  Query: {
    getTeamMembers: requiresAuth.createResolver(
      async (parent, { teamId }, { models }) => {
        try {
          console.log('teamId: ' + teamId);
          return models.sequelize.query(
            'select u.* from users as u inner join members as m on m.user_id = u.id where m.team_id = ?',
            { replacements: [teamId], model: models.User, raw: true }
          );
        } catch (err) {
          console.error('Error: ' + JSON.stringify(err));
          return [];
        }
      }
    )
  },
  Mutation: {
    createTeam: requiresAuth.createResolver(
      async (parent, args, { models, user }) => {
        try {
          const response = await models.sequelize.transaction(
            async transaction => {
              const team = await models.Team.create(
                { ...args, owner: user.id },
                { transaction }
              );
              // Not awaiting Channel not required
              await models.Channel.create(
                {
                  name: 'general',
                  teamId: team.id,
                  public: true
                },
                { transaction }
              );
              await models.Member.create(
                {
                  teamId: team.id,
                  userId: user.id,
                  admin: true
                },
                { transaction }
              );
              return team;
            }
          );
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
    channels: (parent, args, { models, user }) => {
      console.log('Team channel id: ' + JSON.stringify(parent));
      return models.Channel.findAll({
        where: {
          teamId: parent.id,
          [models.Sequelize.Op.or]: [
            { public: true },
            {
              id: {
                [models.Sequelize.Op.in]: models.Sequelize.literal(
                  '(SELECT CHANNEL_ID FROM PCMEMBERS WHERE USER_ID = ' +
                    user.id +
                    ')'
                )
              }
            }
          ]
        }
      });
    },
    directMessageMembers: ({ id }, args, { models, user }) => {
      console.log('dm teamId: ' + id);
      return models.sequelize.query(
        'select distinct on (u.id) u.id, u.username from users as u join direct_messages as dm' +
          ' on (u.id = dm.sender_id) or (u.id = dm.receiver_id)' +
          ' where (:currentUserId = dm.sender_id or :currentUserId = dm.receiver_id)' +
          ' and dm.team_id = :teamId',
        {
          replacements: { currentUserId: user.id, teamId: id },
          model: models.User,
          raw: true
        }
      );
    }
  }
};
