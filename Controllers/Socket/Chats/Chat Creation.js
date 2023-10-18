'use strict';

module.exports = (socket, e) => {
  const users = require('./../../../Actions/user.js');
  const Chats = require('./../../../Actions/chat.js');

  if(typeof e !== 'object') return;
  if(typeof e.name !== 'string') return;
  if(typeof e.token !== 'string') return;
  if(typeof e.public !== 'boolean') return;
  if(typeof e.password !== 'string') return;

  if(!(socket.usrId in users.get_all())) return;
  if(e.token !== users.get(socket.usrId).token) return;

  let create = require('./../../../Actions/chat').create(socket.usrId, e.public ? 'public' : 'private', [ socket.usrId ], e.name, e.password);

  if(typeof create === 'string') {
    socket.emit(create);
    return;
  }
  
  if(e.public) for(let id in chatSockets) {
    let chats = chatSockets[id].chats;
    chats[create.id] = Chats.get(create.id);
    chatSockets[id].socket.emit('Refresh Chats', chats);
  } else {
    let chats = chatSockets[socket.id].chats;
    let chat = Chats.get(create.id);
    chats[create.id] = chat;

    socket.emit('Refresh Chats', chats);
    require('./../../Invites/new_invite')(chat.invite);
  }
};