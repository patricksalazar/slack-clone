import Sequelize from 'sequelize';

const sequelize = new Sequelize('slack', 'postgres', 'postgres', {
  host: '192.168.99.100',
  dialect: 'postgres',
  operatorAliases: Sequelize.Op,
  define: {
    underscored: true
  }
});

const models = {
  User: sequelize['import']('./user'),
  Member: sequelize['import']('./member'),
  Channel: sequelize['import']('./channel'),
  Message: sequelize['import']('./message'),
  Team: sequelize['import']('./team')
};

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

export default models;
