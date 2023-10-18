'use strict';

module.exports = (socket, e) => {
  const users = require('./../../../Actions/user.js');

  if(typeof e !== 'object') return;
  if(typeof e.token !== 'string') return;
  if(typeof socket.usrId === 'undefined') return;
  if(!(socket.usrId in users.get_all())) return; // Mod in final
  if(e.token !== users.get(socket.usrId).token) return; // Mod in final

  let chatKey = e.chat === 0 ? 'main' : e.chat;

  if(!chatKey) return;

  socket.chatChannel = chatKey;

  require('./../../../Helpers/emitsent')(socket, chatKey);
  
  chatMemberSockets[socket.usrId] = socket;
  chatMembers[socket.usrId] = {
    id: socket.usrId,
    username: socket.username,
    count: (chatMembers[socket.usrId] || {count: 0}).count + 1
  };
  
  chatSockets[socket.id] = {
    socket: socket,
    id: socket.usrId,
    chats: new Object()
  };

  SOCKET.IO.emit('User Count', chatMembers);
  
  socket.once('disconnect', () => {
    if(typeof chatMembers[socket.usrId] === 'undefined') {}
    else if(typeof chatMembers[socket.usrId].count !== 'number') {}
    else if(chatMembers[socket.usrId].count === 1) delete chatMembers[socket.usrId];
    else chatMembers[socket.usrId].count--;
  
    delete chatMemberSockets[socket.usrId];
    delete chatSockets[socket.id];
    SOCKET.IO.emit('User Count', chatMembers);
  });
  
  let chats = require('./../../../Actions/chat').get_all();
  let isUsrMember = require('./../../../Helpers/isUsrMember');

  for(let id in chats) {
    let chat = chats[id];

    if(!isUsrMember(chat, socket.usrId)) continue;

    socket.join(id);
    chatSockets[socket.id].chats[id] = chat;
  }

  socket.emit('Refresh Chats', chatSockets[socket.id].chats);
  return socket;
};