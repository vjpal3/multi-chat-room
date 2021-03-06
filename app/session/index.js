'use strict';
const session = require('express-session');
const mongoStore = require('connect-mongo')(session);
const config = require('../config');
const db = require('../db');

if(process.env.NODE_ENV === 'production') {
	//initialize session with settings for production
	module.exports = session({
		secret: config.sessionSecret,
		resave: false,
		saveUninitialized: false,
		store: new mongoStore({
			mongooseConnection: db.Mongoose.connection // allows connect-mongo to interface with mongodb directly.
		})
	});
} else {
	//initialize session with settings for dev
	module.exports = session({
		secret: config.sessionSecret,
		resave: false,
		saveUninitialized: true
		
	});
}