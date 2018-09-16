'use strict';
const h = require('../helpers');
const passport = require('passport');
const config = require('../config');

module.exports = () => {
	let routes = {
		get: { 
			'/': (req, res, next) => {
				res.render("login");
			},
			'/rooms': [h.isAuthenticated, (req, res, next) => {
				res.render("rooms", {user: req.user, host: config.host});
			}], 
			'/chat/:id': [h.isAuthenticated, (req, res, next) => {
				//find a chatroom with given id
				//render it if id found
				let getRoom = h.findRoomById(req.app.locals.chatrooms, req.params.id);
				if(getRoom === undefined) {
					return next();
				} else {
					res.render("chatroom", {
						user: req.user, 
						host: config.host,
						room: getRoom.room,
						roomId: getRoom.roomId
					});
				}
				
			}],
			'/auth/facebook': passport.authenticate('facebook'),
			'/auth/facebook/callback': passport.authenticate('facebook', {
				successRedirect: '/rooms',
				failureRedirect: '/'
			}),
			'/auth/twitter': passport.authenticate('twitter'),
			'/auth/twitter/callback': passport.authenticate('twitter', {
				successRedirect: '/rooms',
				failureRedirect: '/'
			}),
			'/logout': (req, res, next) => {
				req.logout();
				res.redirect('/');
			}
		},
		post: {

		},
		'NA': (req, res, next) => {
			res.status(404).sendFile(process.cwd() + '/views/404.htm');
		}
	}

	//iterate through the routes object and mount the routes.
	return h.route(routes);

	//registerRoutes(routes);
	//return router;
}