const Config = require('../config');
const Sequelize = require('sequelize');

const Item = Config.sequelize.define('items', {
	name: Sequelize.STRING,
	description: Sequelize.STRING,
	count: Sequelize.STRING,
	createdAt: Sequelize.DATE,
	updatedAt: Sequelize.DATE,
});

module.exports = Item;
