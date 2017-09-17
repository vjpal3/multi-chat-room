'use strict';

const passport = require('passport');
const config = require('../config');
const h = require('../helpers');
const logger = require('../logger');

const FacebookStrategy = require('passport-facebook').Strategy; 
//Strategy is a constructor function in passport-facebook module, provides authentication and login
const TwitterStrategy = require('passport-twitter').Strategy;

module.exports = () => {
	passport.serializeUser((user, done) => {
		done(null, user.id);
	});

	passport.deserializeUser((id, done) => {
		//find the user using the _id
		//.catch(error => console.log('Error when deserializeUser'));
		h.findById(id)
			.then(user => done(null, user))
			.catch(error => logger.log('error', 'Error when deserializing the user: ' + error));
	});

	//authprocessor function is called verify callback - to verify a user in local mongoDB instance.
	//accessToken & refreshToken- provided by FB as part of OAuth2.0 impl.
	//done is a function 
	let authProcessor = (accessToken, refreshToken, profile, done) => {
		//Find a user in the local db using profile.id (profile is an object)
		//if the user is found, return the user data using done().
		//done() makes the data from passport availble to the app.

		h.findOne(profile.id)
			.then(result => {
				if(result) {
					done(null, result); // gets the data out of authentication pipeline into the passport for our app
				} else { //if no user, create one in the local db & invoke done() to return the same
					  //.catch(error => console.log('Error when creating new user'));
					h.createNewUser(profile)
						.then(newChatUser => done(null, newChatUser))
						.catch(error => logger.log('error', 'Error when creating new user: ' + error));
				}
			});
	}

	passport.use(new FacebookStrategy(config.fb, authProcessor));
	passport.use(new TwitterStrategy(config.twitter, authProcessor));
}
