'use strict';

module.exports = (socket, data) => {
  const users = require('./../../../Actions/user.js');

  if(typeof data !== 'object') return;
  if(typeof data.token !== 'string') return;
  if(typeof socket.usrId === 'undefined') return;
  if(!(socket.usrId in users.get_all())) return;
  if(data.token !== users.get(socket.usrId).token) return;

  let chat = require('./../../../Actions/chat').delete(socket.usrId, data);
  if(typeof chat === 'undefined') return;

  let chatKey = socket.chatChannel;

  Object.values(chatSockets).forEach(cSocket => {
    if(!(chatKey in cSocket.chats)) return;
    cSocket.socket.emit('Chat Deleted', chat.id);
    cSocket.socket.leave(chatKey);
  });
};