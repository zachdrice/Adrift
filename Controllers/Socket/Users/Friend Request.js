'use strict';

module.exports = (socket, e) => {
  const HTMLEntities = require('./../../../Helpers/htmlentities');
  const users = require('./../../../Actions/user.js');

  if(users.get(socket.usrId).token !== e.token) return;
  if(!(e.to in users.get_all())) return;

  const sockets = Object.values(chatSockets).filter(cs => cs.id === e.to);
  sockets.forEach(cSocket => cSocket.socket.emit('Friend Request', {
    id: socket.usrId,
    name: HTMLEntities(users.get(socket.usrId).username)
  }));
};