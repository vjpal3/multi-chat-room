'use strict'

const winston = require('winston');

//(winston.Logger) --> require('./winston/logger').Logger --> 
//new keyword creates instance of Logger() method. Then invoke it ({}) by passing an object
////transports --> various ways to log out data
const logger = new(winston.Logger)({
	transports: [
		new(winston.transports.File)({
			level: 'debug',
			filename: './chatDebug.log',
			handleExceptions: true
		}),
		new(winston.transports.Console)({
			level: 'debug',
			json: true,
			handleExceptions: true
		})
	], 
	exitOnError: false
});

module.exports = logger;