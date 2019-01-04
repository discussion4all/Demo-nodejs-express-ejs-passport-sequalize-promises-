const Sequelize = require('sequelize');

const Op = Sequelize.Op;

const sequelize = new Sequelize('test', 'root', '', {
	host: 'localhost',
	dialect: 'mysql',
	operatorsAliases: { $like: Op.like },
	define: {
        timestamps: false
    }
});

const config = { 
	jwtSecret: "devdacticIsAwesome",
	sequelize: sequelize
};

module.exports = config;