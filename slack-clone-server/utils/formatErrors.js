import _ from 'lodash';
import sequelize from 'sequelize';

export const formatErrors = (e, models) => {
  if (e instanceof sequelize.ValidationError) {
    return e.errors.map(x => _.pick(x, ['path', 'message']));
  }
  return [{ path: 'name', message: JSON.stringify(e) }];
};
