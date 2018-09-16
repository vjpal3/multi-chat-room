'use strict'
const h = require('../helpers');

module.exports = (io, app) => {
  let allrooms =app.locals.chatrooms;	 

  // Eventlistener will listen to the handshake from rooms.ejs 
  io.of('/roomslist').on('connection', socket => {
  	//console.log('socket.io connected to Client!');
  	socket.on('getChatRooms', ()=> {
  		socket.emit('chatRoomsList', JSON.stringify(allrooms));
  	});

  	socket.on('createNewRoom', newRoomInput=> {
  		//console.log(newRoomInput);
  		//check if a room with the same title exists.
  		//if not, create one and broadcast to everyone.
  		if(!h.findRoomByName(allrooms, newRoomInput)) {
  			//create room and broadcast to all
  			allrooms.push( {
  				room: newRoomInput,
  				roomId: h.randomHex(),
  				users: []
  			});

  			//Emit an updated list to the creator
  			socket.emit('chatRoomsList', JSON.stringify(allrooms));
  			//Emit an updated list to everyone connected to rooms page
  			socket.broadcast.emit('chatRoomsList', JSON.stringify(allrooms));
  		}

  	});
  });

  io.of('/chatter').on('connection', socket => {
  	//join a chatroom
  	socket.on('join', data => {
     let usersList = h.addUserToRoom(allrooms, data, socket);
     //update the list of active users as shown on the chatroom page
     //console.log('usersList: ', usersList);
     /* usersList:  { 
          room: 'Good Books',
          roomId: '5f01e009c307a59455b435f129fd1eef6e12fa3e2bbcebb6',
          users:
            [ { socketId: '/chatter#0xQTBOrzRw3RDaOsAAAD',
                userId: '59ba94abe431c53ee8e3bd26',
                user: 'Vrishali Pal',
                userPic: 'https://scontent.xx.fbcdn.net/v/865....' 
              } ] 
        } */
      //update the list of active users as shown on the chatroom page  
      socket.broadcast.to(data.roomId).emit('updateUsersList', JSON.stringify(usersList.users));
      socket.emit('updateUsersList', JSON.stringify(usersList.users));
  	});

    //when a socket exits
    socket.on('disconnect', () => {
      //find the room to which the socket was connected to and purge the user
      let room = h.removeUserFromRoom(allrooms, socket);
      socket.broadcast.to(room.roomId).emit('updateUsersList', JSON.stringify(room.users));
    });

    //When a new message arrives
    socket.on('newMessage', data => {
      socket.to(data.roomId).emit('inMessage', JSON.stringify(data));
    });
  });

}