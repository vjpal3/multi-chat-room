const router = require("express").Router();
const db = require("../db");
const crypto = require('crypto');

let _registerRoutes = (routes, method) => { //recursive function
		for(let key in routes) {
			if(typeof routes[key] === 'object' && routes[key] != null && !(routes[key] instanceof Array)) {
				_registerRoutes(routes[key], key);
			}	
			else {
				//register the routes
				if(method === 'get') {
					router.get(key, routes[key]);
				}
				else if(method === 'post') {
						router.post(key, routes[key]);
					
				}
				else {
					router.use(routes[key]); //mount any middleware function we want to use
				}
			}
		}
}

let route = routes => {
	_registerRoutes(routes);
	return router;
}

//Find a single user based on key.
//To the findOne(), we pass an object which maps the key to be queried to, to the value we want to query with 
//findOne() returns a promise
let findOne = profileId => {
	return db.userModel.findOne({
		'profileId' : profileId
	});
}

//create a new user and return that instance
let createNewUser = profile => {
	return new Promise((resolve, reject) => {
		let newChatUser = new db.userModel({
			profileId: profile.id,
			fullName: profile.displayName,
			profilePic: profile.photos[0].value || ''
		});

		newChatUser.save(error => {
			if(error) {
				reject(error);
			} else {
				resolve(newChatUser);
			}
		});
	});
}

//The ES6 promisified version of findById
let findById = id => {
	return new Promise((resolve, reject) => {
		db.userModel.findById(id, (error, user) => {
			if(error) {
				reject(error);
			} else {
				resolve(user);
			}
		});
	});
}

//middleware to check if the user is authentic and logged in

let isAuthenticated = (req, res, next) => {
	if(req.isAuthenticated()) {
		next();
	} else {
		res.redirect('/');
	}
}

let findRoomByName = (allrooms, room) => {
	let findRoom = allrooms.findIndex((element, index, array) => {
		if(element.room === room) {  //Use regex here
			//console.log(element.room, '****', room);
			return true;
		} else {
			return false;
		}
	});

	return findRoom > -1 ? true : false;
}

//A function that generates a unique roomId
let randomHex = () => {
	return crypto.randomBytes(24).toString('hex'); //syncronous, without callback, works for simple case
}

//find a chatroom with given id
let findRoomById = (allrooms, roomId) => {
	return allrooms.find((element, index, array) => {
		if(element.roomId === roomId) {
			return true;
		} else {
			return false;
		}
	}); 
}

//Add a user to a chatroom
let addUserToRoom =(allrooms, data, socket) => {
	//Get the room object from the chatroom array
	let getRoom = findRoomById(allrooms, data.roomId);
	if(getRoom !== undefined) {
		//Get the active user's Id (Object Id as used in Session)
		let userId = socket.request.session.passport.user;
		//check to see if user already exists in the chatroom
		let checkUser = getRoom.users.findIndex((element, index, array) => {
			if(element.userId === userId) {
				return true;
			} else {
				return false;
			}
		});
		//if the user is already in the room, remove him first
		if(checkUser > -1) {
			getRoom.users.splice(checkUser, 1);
		}

		//push the user to the users array
		getRoom.users.push({
			socketId: socket.id,  //assigned by socket.io when it creates a connection everytime
			userId,
			user: data.user,
			userPic: data.userPic
		})

		//join the room channel
		socket.join(data.roomId);

		//return the updated room object
		return getRoom;
	}
}

//find and purge the user when socket disconnects
let removeUserFromRoom = (allrooms, socket) => {
	for(let room of allrooms) {
		//find the user
		let findUser = room.users.findIndex((element, index, array) => {
			if(element.socketId === socket.id) {
				return true;
			} else {
				return false;
			}
			// return element.socketId === socket.id ? true: false;
		});
		if(findUser > -1) {
			socket.leave(room.roomId);
			room.users.splice(findUser, 1);
			return room;
		}
	}
}

module.exports = {
	route,
	findOne,
	createNewUser,
	findById,
	isAuthenticated,
	findRoomByName, 
	randomHex,
	findRoomById,
	addUserToRoom,
	removeUserFromRoom
}