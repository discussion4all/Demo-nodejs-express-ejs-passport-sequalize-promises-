var express = require('express');
var router = express.Router();
var passport = require('passport');
require('./passport')(passport);
var userController = require('./controllers/userController');
var itemController = require('./controllers/itemController');

/* -----------------------Route For Login Process --------------------- */
router.get('/', userController.getLogin);
router.post('/', function(req, res, next) {
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	var errors = req.validationErrors();
	if (errors) {
		var messages = {};
		errors.forEach(function(error) {
			messages[error.param] = error.msg;
		});
		req.flash('formdata', req.body);
		req.flash('Error', messages);
	}
	next();
}, passport.authenticate('local-login', {
	failureRedirect : '/', 
	failureFlash : true
}), userController.login);

/* -------------------- Route for Registration Process ---------------- */
router.get('/signup', userController.getSignup);
router.post('/signup', function(req, res, next) {
	req.checkBody('username', 'Must be between 3 and 32 characters').notEmpty().matches(/[a-zA-Z]{3,32}/, "i");
	req.checkBody('email', 'Must be a valid email address').notEmpty().isEmail();
	req.checkBody('firstname', 'Required').notEmpty();
	req.checkBody('lastname', 'Required').notEmpty();
	req.checkBody('password', 'Must be at least six chars').notEmpty().isLength({min :6});
	var errors = req.validationErrors();
	if (errors) {
		var messages ={};
		errors.forEach(function(error) {
			messages[error.param] = error.msg;
		});
		req.flash('formdata', req.body);
		req.flash('Error', messages);
	}
	next();
}, passport.authenticate('local-signup', {
	failureRedirect : '/signup', 
	failureFlash : true
}), userController.signup);

/* -------------------- Route for Logout Process ---------------- */
router.get('/logout', userController.logout);

/* --------------- Middleware for get Token  --------- */
var authorizeToken = function(req, res, next){
	// Set authorization header for token
	if(req.session.token) {
		req.headers.authorization = 'JWT ' + req.session.token; 
		next();
	} else {
		return res.status(403).send({success: false, message: 'Unauthorized.'});
	}
};

/* ------------- Middleware for authenticate token ----------- */
var passportAuthentication =  passport.authenticate('jwt', {session: false});

/* ------------------ List Of Items on Home Page ------------- */
router.get('/home', authorizeToken, passportAuthentication, itemController.list);

/* ------------------ Search Items on Home Page ------------- */
router.post('/home', authorizeToken, passportAuthentication, itemController.search);

/* ------------------ Add New Item Page ------------- */
router.get('/add', authorizeToken, passportAuthentication, itemController.add);

router.post('/add', authorizeToken, passportAuthentication, function(req, res, next) {
	req.checkBody('name', 'Required').notEmpty();
	req.checkBody('description', 'Required').notEmpty();
	req.checkBody('count', 'Required').notEmpty();
	var errors = req.validationErrors();
	req.errors ={};
	if (errors) {
		var messages ={};
		errors.forEach(function(error) {
			messages[error.param] = error.msg;
		});
		req.errors = messages;
		req.flash('formdata', req.body);
		req.flash('Error', messages);
	}
	next();
}, itemController.save);

/*----------------- View Item Page ----------------- */
router.get('/view/:id', authorizeToken, passportAuthentication, itemController.view);

module.exports = router;