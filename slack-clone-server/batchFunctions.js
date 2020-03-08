export const channelBatcher = async (ids, models, user) => {
  const results = await models.Channel.findAll({
    where: {
      teamId: { [models.op.in]: ids },
      [models.op.or]: [
        { public: true },
        {
          id: {
            [models.op.in]: models.Sequelize.literal(
              '(SELECT CHANNEL_ID FROM PCMEMBERS WHERE USER_ID = ' +
                user.id +
                ')'
            )
          }
        }
      ]
    },
    raw: true
  });

  const data = {};

  // group by team
  results.forEach(r => {
    if (data[r.teamId]) {
      data[r.teamId].push(r);
    } else {
      data[r.teamId] = [r];
    }
  });

  return ids.map(id => (data[id] ? data[id] : []));
};

export const dmMemberBatcher = async (ids, models, user) => {
  const results = await models.sequelize.query(
    'select distinct on (u.id) u.id, u.username from users as u join direct_messages as dm' +
      ' on (u.id = dm.sender_id) or (u.id = dm.receiver_id)' +
      ' where (:currentUserId = dm.sender_id or :currentUserId = dm.receiver_id)' +
      ' and dm.team_id in (:teamIds)',
    {
      replacements: { currentUserId: user.id, teamIds: ids },
      model: models.User,
      raw: true
    }
  );
  console.log('***results***');
  console.log(results);

  // group by team
  const data = {};
  results.forEach(r => {
    if (data[r.teamId]) {
      data[r.teamId].push(r);
    } else {
      data[r.teamId] = [r];
    }
  });

  return ids.map(id => (data[id] ? data[id] : []));
};
