'use strict';

module.exports = (socket, e) => {
  const users = require('./../../../Actions/user.js');
  
  if(typeof e !== 'object') return;
  if(typeof e.token !== 'string') return;
  if(!(socket.usrId in users.get_all())) return;
  if(e.token !== users.get(socket.usrId).token) return;

  if('invite' in e) {
    require('./../../../Actions/chat').join_by_invite(socket.usrId, e.invite);
    socket.emit('Joined from Invite');
  } else {
    if(typeof e.name !== 'string') return;
    if(typeof e.password !== 'string') return;

    let join = require('./../../../Actions/chat').add_user(socket.usrId, socket.id, e);
    if(typeof join === 'string') return socket.emit(join);
    socket.emit('Refresh Chats', chatSockets[socket.id].chats);
  }
};