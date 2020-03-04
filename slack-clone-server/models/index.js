import Sequelize from 'sequelize';

console.log('TEST: ' + process.env.TEST_DB);
const sequelize = new Sequelize(
  process.env.TEST_DB || 'slack',
  'postgres',
  'postgres',
  {
    // host: '192.168.99.100',
    host: 'localhost',
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
  DirectMessage: sequelize['import']('./directMessage')
};

Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

models.sequelize = sequelize;
models.Sequelize = Sequelize;

export default models;
