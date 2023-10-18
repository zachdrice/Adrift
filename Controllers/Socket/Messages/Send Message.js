'use strict';

module.exports = (socket, data) => {
  const Format = require('./../../../Helpers/formatter');
  const HTMLEntities = require('./../../../Helpers/htmlentities');
  const chats = require('./../../../Actions/chat.js');

  if(typeof data !== 'string') return;
  if(typeof socket.usrId === 'undefined') return;

  if(data.replace(/ |\t|\n/g, new String()).length < 1) return;

  const chat = chats.get(socket.chatChannel);
  SOCKET.IO.to(socket.chatChannel).emit('New Message', {
    msg: Format(HTMLEntities(data)),
    usr: {
      name: socket.username,
      id: socket.usrId
    },
    chat: {
      // name: chat.name,
      id: chat.id
    },
    id: chat.messages.length,
    sent: Date.now()
  });

  require('./../../../Actions/message').send(socket.chatChannel, socket.username, socket.usrId, data);
};