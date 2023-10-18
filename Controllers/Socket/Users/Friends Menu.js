'use strict';

module.exports = socket => {
  socket.chatChannel = undefined;
  socket.emit('Refresh Chats', chatSockets[socket.id].chats);
  return socket;
};