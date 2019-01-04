var User = require('../models/user');
var jwt = require('jsonwebtoken');
var config = require('../config');
var Cookies = require('cookies');
var sendmail = require('sendmail')();

// --------- Login Page ------
module.exports.getLogin = function(req, res, next) {
	var formData = req.flash('formdata')[0];
	res.render('login', { error: req.flash('Error')[0], formData : formData, message :req.flash('success')});
}

module.exports.login = function(req, res, next) {
	generateToken(req);
	res.redirect('/home');
}

function generateToken(req) {
	/* --------- Generate Token using passport-jwt and web Token----------- */
	var token = jwt.sign({email: req.user.email, username: req.user.username, id: req.user.id}, config.jwtSecret);
	req.session.token = token; // Save token in session
}

// --------- Registration Page ------
module.exports.getSignup = function(req, res) {
	res.render('signup', {error: req.flash('Error')[0], formData: req.flash('formdata')[0]});
}

module.exports.signup = function(req, res) {
	generateToken(req);
	res.redirect('/home');
}

// --------- Logout --------
module.exports.logout = function(req, res) {
	req.logout();
	req.session.destroy(); // Session Destroy
	res.redirect('/');
}
