import { tryLogin } from '../auth';
import { formatErrors } from '../utils/formatErrors';

export default {
  Query: {
    getUser: (parent, { id }, { models }) =>
      models.User.findOne({ where: { id } }),
    allUsers: (parent, args, { models }) => models.User.findAll()
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
  }
};
