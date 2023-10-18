'use strict';

module.exports = (socket, e) => {
  if(typeof socket.usrId === 'undefined') return;

  const HTMLEntities = require('./../../../Helpers/htmlentities');
  const users = require('./../../../Actions/user');
  const user = users.get(socket.usrId);

  if(user.token !== e.token) return;
  if(!(e.id in users.get_all())) return;

  let res = 'rejected';

  if(e.accepted) {
    let add = users.friend_add(socket.usrId, e);
    if(!add) return;

    res = 'accepted';
  }

  let s = `${HTMLEntities(user.username)} ${res} your request`;

  const sockets = Object.values(chatSockets).filter(cs => cs.id === e.id);
  sockets.forEach(cSocket => cSocket.socket.emit('Friend Response', s))
};