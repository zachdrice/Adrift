'use strict';

module.exports = (socket, e) => {
  if(typeof socket.usrId === 'undefined') return;

  let friends = require('./../../../Actions/user').friend_get(socket.usrId, e);

  socket.emit('Refresh Chats', chatSockets[socket.id].chats);
  socket.emit('Friends', friends);
};