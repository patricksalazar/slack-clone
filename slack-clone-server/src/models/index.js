import Sequelize from 'sequelize';

const sequelize = new Sequelize(
  process.env.TEST_DB || process.env.DB_NAME || 'slack',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'postgres',
  {
    host: process.env.DB_HOST || '192.168.99.100',
    dialect: 'postgres',
    operatorAliases: Sequelize.Op,
    define: {
      underscored: true
    }
  }
);

const models = {
  User: sequelize['import']('./user'),
  Member: sequelize['import']('./member'),
  Channel: sequelize['import']('./channel'),
  Team: sequelize['import']('./team'),
  Message: sequelize['import']('./message'),
  DirectMessage: sequelize.import('./directMessage'),
  PCMember: sequelize['import']('./pcmember')
};

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;
models.op = Sequelize.Op;
models.DEFAULT_LIMIT = 10;

export default models;
