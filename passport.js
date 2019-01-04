var LocalStrategy = require('passport-local').Strategy; 
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;
var User = require('./models/user');
var config = require('./config');

module.exports = function(passport) {

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id).then(function(result) {
			var user = JSON.stringify(result);
			done(null, user);
		});
	});

	//----------- For login Process -----------

	passport.use('local-login', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
		passReqToCallback : true
	},
	function(req, email, password, done) {
		const resultPromise = new Promise(async(resolve, reject) => {
			try {
				var errors = {};
				const user = await User.findOne({
					where : {
						'email':  email
					}
				});

				resolve(user)
			}catch(err) {
				reject(err)
			}
		});

		resultPromise.then((user) => {
			if (!user) {
				req.flash('formdata', req.body);
				errors['email'] = 'User not found';
				return done(null, false, req.flash('Error', errors));
			}
			if (!user.validPassword(req.body.password)) {
				req.flash('formdata', req.body);
				errors['password'] = 'Incorrect password';
				return done(null, false, req.flash('Error', errors));
			}
			return done(null, user);
		}).catch((err) => {
			req.flash('formdata', req.body);
			return done(err);
		})

	}));
	

	//-------- For Signup (Registration Process) ------------

	passport.use('local-signup', new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback : true 
	},
	function(req, email, password, done) {
		const resultPromise = new Promise(async(resolve, reject) => {
			try {
				const result = await User.findAll({
					where :{
						$or: [ { email: email}, { username: req.body.username } ] 
					}
				});

				var errors = {};
				
				if (result) {
					var user = JSON.parse(JSON.stringify(result));
					user.forEach(function(data) {
					    if (data.username == req.body.username) {
					    	req.flash('formdata', req.body);
							errors['username'] = 'Already exists';
					    }
					    if (data.email == email){
					    	req.flash('formdata', req.body);
							errors['email'] = 'Already registered';
					    }
					});
				}

				if (Object.keys(errors).length > 0) {
					resolve({errors: errors});
				} else {
					var newUser = new User();

					newUser.email = req.body.email;
					newUser.password = newUser.generateHash(req.body.password);
					newUser.username = req.body.username;
					newUser.firstname = req.body.firstname;
					newUser.lastname = req.body.lastname;

					const user = await newUser.save();

					resolve({user: user});
				}
			}catch(err) {
				reject(err);
			};
		});

		resultPromise.then((response) => {
			console.log(response.errors);
			if (response.user) 
				return done(null, response.user);
			else if(response.errors)
				return done(null, false, req.flash('Error', response.errors));
		}).catch((err) => {
			if (err) {
				console.log(err);
				return done(null, false, req.flash(err));
			}
		})
	}));

	// ------------- Use of passport-jwt for authenticate token

	var opts = {};
	opts.jwtFromRequest = ExtractJwt.fromAuthHeaderWithScheme('jwt');
	opts.secretOrKey = config.jwtSecret;

	passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
		const resultPromise = new Promise(async(resolve, reject) => {
			try {
				const user = await User.findOne({
					where :{
						id: jwt_payload.id
					}
				});

				resolve(user);
			} catch(err) {
				reject(err);
			}
		});

		resultPromise.then((user) => {
			if (user)
				return done(null, user);
			else 
				return done(null, false);
		}).catch((err) => {
			return done(err, false);
		});
	}));
}