var Item = require('../models/item');
var config = require('../config');


// --------- Item List ------
module.exports.list = function(req, res) {
	const resultPromise = new Promise(async(resolve, reject) => {
		try {
			if (req.user) {
				const items = await Item.findAll();
				resolve(items);
			}
		} catch(err) {
			reject(err);
		}
	});

	resultPromise.then((items) => {
		if (items)
			res.render('home', {items: items, user:req.user, search: ''});
	}).catch((err) => {
		res.status(400).send(err);
	});
}

// --------- Item Search ------
module.exports.search = function(req, res) {
	const resultPromise = new Promise(async(resolve, reject) => {
		try {
			if (req.user) {
				const items = await Item.findAll({
					where: {
						name: {
							$like: '%' + req.body.search + '%'
						}
					}
				});

				resolve(items);
			}
		} catch(err) {
			reject(err);
		}
	});

	resultPromise.then((items) => {
		if (items)
			res.render('home', {items: items, user:req.user, search: req.body.search});
	}).catch((err) => {
		res.status(400).send(err);
	})
}

// --------- Add Item ------
module.exports.add = function(req, res) {
	if (req.user) {
		res.render('add',{
			user : req.user, 
			message : req.flash('success'), 
			error : req.flash('Error')[0]
		});
	}
}

//-------- Save Item ---------
module.exports.save = function(req, res) {
	const resultPromise = new Promise(async(resolve, reject) => {
		try {
			if (req.user) {
				if (Object.keys(req.errors).length > 0) {
					req.flash('Error', req.errors);
					res.redirect('/add');
				} else {
					
					var newItem = new Item();

					newItem.name = req.body.name;
					newItem.description = req.body.description;
					newItem.count = req.body.count;

					const item = await newItem.save();

					resolve();
				}
					
			}
		} catch(err){
			if (err)
				reject(err);
		}
	});

	resultPromise.then(() => {
		res.redirect('/home');
	}).catch((err) => {
		res.status(400).send(err);
	})
}

// ------------ View Item ---------
module.exports.view = function(req, res) {
	const resultPromise = new Promise(async(resolve, reject) => {
		try {
			if (req.user) {
				const item = await Item.findOne({
					where: {
						id: req.params.id
					}
				});
				resolve(item);
			}
		} catch(err) {
			if (err)
				reject(err);
		}
	});

	resultPromise.then((item) => {
		res.render('view',{
			item: item,
			user: req.user
		});
	}).catch((err) => {
		res.status(400).send(err);
	})

}
