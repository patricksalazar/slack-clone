import formatErrors from '../utils/formatErrors';
import { requiresAuth } from '../utils/permissions';

export default {
  Mutation: {
    createChannel: requiresAuth.createResolver(
      async (parent, args, { models, user }) => {
        try {
          console.log('createChannel and team');
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

          const response = await models.sequelize.transaction(
            async transaction => {
              const channel = await models.Channel.create(args, {
                transaction
              });
              console.log(channel);
              if (!args.public) {
                const members = args.members.filter(m => m != user.id);
                members.push(user.id);
                const pcmembers = await models.PCMember.bulkCreate(
                  members.map(m => ({
                    userId: m,
                    channelId: channel.dataValues.id
                  })),
                  { transaction }
                );
                console.log('pcmembers: ' + JSON.stringify(pcmembers));
              }
              return channel;
            }
          );
          return {
            ok: true,
            channel: response
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
    createDMChannel: requiresAuth.createResolver(
      async (parent, { teamId, members }, { models, user }) => {
        try {
          const member = await models.Member.findOne(
            { where: { teamId, userId: user.id } },
            { raw: true }
          );
          if (!member) {
            throw new Error('Not Authorized');
          }

          const allMembers = [...members, user.id];
          console.log('In createDMChannel');

          // check if dm channel already exists with these members
          const [data, result] = await models.sequelize.query(
            `
            SELECT c.ID, c.NAME, c.DM, c.PUBLIC FROM CHANNELS AS c 
            JOIN PCMEMBERS pc ON c.ID=pc.CHANNEL_ID
            WHERE c.DM=TRUE AND c.PUBLIC=FALSE AND c.TEAM_ID=:teamId
            GROUP BY c.ID, c.NAME, c.DM, c.PUBLIC
            HAVING array_agg(pc.USER_ID) @> Array[${allMembers.join(',')}] 
            and count(pc.USER_ID) = :userCount;
          `,
            {
              replacements: { teamId, userCount: allMembers.length },
              model: models.Channel,
              raw: true
            }
          );
          if (data) {
            console.error('Duplicate');
            return { ok: true, channel: data[0] };
          }

          const users = await models.User.findAll({
            where: {
              id: {
                [models.Sequelize.Op.in]: members
              }
            },
            raw: true
          });
          const name = users.map(u => u.username).join(', ');
          console.log('name:' + name);

          // Create channel and corresponding members to the channel
          const channelData = await models.sequelize.transaction(
            async transaction => {
              const channel = await models.Channel.create(
                { name, public: false, dm: true, teamId },
                {
                  transaction
                }
              );
              console.log(channel);

              const cId = channel.dataValues.id;
              const pcmembers = await models.PCMember.bulkCreate(
                allMembers.map(m => ({
                  userId: m,
                  channelId: cId
                })),
                { transaction }
              );
              console.log('pcmembers: ' + JSON.stringify(pcmembers));
              return channel;
            }
          );

          return {
            ok: true,
            channel: channelData
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
