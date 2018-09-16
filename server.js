'use strict';
const express = require("express");
const app = express();
const chatCat = require('./app'); //index.js file in app folder
const passport = require('passport');

app.set('port', process.env.PORT || 3000);
app.use(express.static('public'));
app.set('view engine', 'ejs');

app.use(chatCat.session); //should come before mounting the router.
app.use(passport.initialize()); //hooks up passport to req and res stream that express provides access to
app.use(passport.session()); //hooks up express session middleware with passport

app.use(require('morgan')('combined', {
	stream: {
		write: message => {
			//write to logs
			chatCat.logger.log('info', message);
		}
	}
}));


app.use('/', chatCat.router);

chatCat.ioServer(app).listen(app.get('port'), () => {
	console.log('ChatCat Running on port : ', app.get('port'));
});
