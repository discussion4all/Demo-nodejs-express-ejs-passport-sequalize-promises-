const Config = require('../config');
const Sequelize = require('sequelize');

const User = Config.sequelize.define('users', {
	username: Sequelize.STRING,
	firstname: Sequelize.STRING,
	lastname: Sequelize.STRING,
	email: Sequelize.STRING,
	password: Sequelize.STRING,
});

var bcrypt = require('bcrypt-nodejs');

// ------------- Encrypt Password --------------
User.prototype.generateHash = function(password) {
	return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);
};

// ------------- Decrypt Password --------------
User.prototype.validPassword = function(password) {
	return bcrypt.compareSync(password, this.password);
};

module.exports = User
