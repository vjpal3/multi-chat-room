'use strict';

const config = require('./config');
const redis = require('redis').createClient;
const adapter = require('socket.io-redis');

//social Authentication Logic
require('./auth')();

//create an IO Server instance 
//this function returns a server instance to which io is already locked on
let ioServer = app => {
	app.locals.chatrooms = [];
	const server = require('http').Server(app); // app is our Express app instance from server.js
	const io = require('socket.io')(server);
	io.set('transports', ['websocket']);

	//invokes createClient method on redis
	let pubClient = redis(config.redis.port, config.redis.host, {
		auth_pass: config.redis.password
	});

	let subClient = redis(config.redis.port, config.redis.host, {
		return_buffers: true,
		auth_pass: config.redis.password
	});
	//custom adapter, short hand object literal notation
	io.adapter(adapter({
		pubClient,
		subClient
	}));

	//bridging socket.io with session, since request stream not available in socket module
	io.use((socket, next) => { //socket injected by socket.io
		require('./session')(socket.request, {}, next); //response part empty as we don't want to write back to the session
	});
	/*
	See QA_notes.odt: function someMiddleware(req, res, next) {}


	*/
	require('./socket')(io, app);
	return server;
}

module.exports = {
	router: require('./routes')(),
	session: require('./session'),
	ioServer,
	logger: require('./logger')
}