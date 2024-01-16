/* eslint-disable @typescript-eslint/no-var-requires */
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'main.db',
});

module.exports = sequelize;
