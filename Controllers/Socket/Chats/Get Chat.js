'use strict';

module.exports = (socket, invite) => {
  const chats = require('./../../../Actions/chat');
  const users = require('./../../../Actions/user');
  const chat = chats.get_by_invite(invite);

  let output;

  if(typeof chat === 'undefined') {
    output = {isValid: false};
  } else {
    output = {
      name: chat.name,
      members: chat.users.length,
      created: chat.created,
      owner: users.get(chat.owner).username,
      inChat: chat.users.indexOf(socket.usrId) > -1,
      isValid: true
    };
  }

  socket.emit('Recieved Chat', output);
};