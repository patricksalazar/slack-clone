import { tryLogin } from '../auth';
import { formatErrors } from '../utils/formatErrors';
import { requiresAuth } from '../utils/permissions';

export default {
  Query: {
    getUser: (parent, { userId }, { models }) =>
      models.User.findOne({ where: { id: userId } }),
    allUsers: (parent, args, { models }) => models.User.findAll(),
    me: requiresAuth.createResolver((parent, args, { models, user }) =>
      models.User.findOne({ where: { id: user.id } })
    )
  },
  Mutation: {
    login: (parent, { email, password }, { models, SECRET, SECRET2 }) =>
      tryLogin(email, password, models, SECRET, SECRET2),
    register: async (parent, args, { models }) => {
      try {
        const user = await models.User.create(args)
          .then(user => {
            return user;
          })
          .catch(err => {
            throw err;
          });

        return {
          ok: true,
          user
        };
      } catch (err) {
        // console.error(
        //   'An error occurred in hashPassword: ' + JSON.stringify(err)
        // );
        return {
          ok: false,
          errors: formatErrors(err, models)
        };
      }
    }
  },
  User: {
    teams: (parent, args, { models, user }) => {
      console.log("user teams query");
      return models.sequelize.query(
        'select t.*, m.admin from teams as t inner join members as m on t.id = m.team_id where m.user_id = ?',
        { replacements: [user.id], model: models.Team, raw: true }
      );
    }
  }
};
