'use strict';
const config = require('../config');
const logger = require('../logger');

/*const Mongoose = require('mongoose').connect(config.dbURI, 
	{useMongoClient: true}, 
	error => {
		if(error) {
			console.log("Mongodb error: " + error);
 		}
	}
); */

/*mongoose.connection.on('error', error => {
	console.log("Mongodb error: " + error);
}); */

const Mongoose = require('mongoose');
Mongoose.Promise = global.Promise; 

//create a schema that defines the structure for storing user data
const chatUser = new Mongoose.Schema({
	profileId: String, 
	fullName: String,
	profilePic: String

});

Mongoose.connect(config.dbURI, 
	{useMongoClient: true}, 
	error => {
		if(error) {
			//console.log("Mongodb error: " + error);
			logger.log('error', 'Mongoose connection error: ' + error);
 		}
	}
);


//Turn schema into an usable model. This model allows us to 
//create documents and store in the collection
//This code should come after mongoose.connect()
let userModel = Mongoose.model('chatUser', chatUser);

module.exports = {
	Mongoose,  // holds the instance for db connection
	userModel
}