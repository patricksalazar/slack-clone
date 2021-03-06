// TODO see if there is an alternative apollo server authorization app
const createResolver = resolver => {
  const baseResolver = resolver;
  baseResolver.createResolver = childResolver => {
    const newResolver = async (parent, args, context, info) => {
      await resolver(parent, args, context, info);
      return childResolver(parent, args, context, info);
    };
    return createResolver(newResolver);
  };
  return baseResolver;
};

// requiresAuth
export const requiresAuth = createResolver((parent, args, { user }) => {
  if (!user || !user.id) {
    throw new Error('Not Authenticated');
  }
});

export const requiresAdmin = requiresAuth.createResolver(
  (parent, args, context) => {
    if (!context.user.isAdmin) {
      throw new Error('Not Authenticated');
    }
  }
);

export const requiresTeamAccess = createResolver(
  async (parent, { channelId }, { user, models }) => {
    if (!user || !user.id) {
      throw new Error('Not authenticated');
    }
    // check if part of the team
    const channel = await models.Channel.findOne({
      where: { id: channelId },
      raw: true
    });

    let member = null;
    if (channel) {
      member = await models.Member.findOne({
        where: { teamId: channel.teamId, userId: user.id }
      });
    }

    if (!member) {
      throw new Error(
        "You have to be a member of the team to subscribe to it's messages"
      );
    }
  }
);

export const directMessageSubscription = createResolver(
  async (parent, { teamId, userId }, { user, models }) => {
    if (!user || !user.id) {
      throw new Error('Not authenticated');
    }
    // check if part of the team
    const members = await models.Member.findAll({
      where: {
        teamId,
        [models.Sequelize.Op.or]: [{ userId }, { userId: user.id }]
      }
    });
    if (members.length !== 2) {
      throw new Error(
        'You have to be part of the direct message group to subscribe'
      );
    }
  }
);
