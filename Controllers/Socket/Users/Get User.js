'use strict';

module.exports = (socket, e) => {
  if(typeof socket.usrId === 'undefined') return;
  
  const users = require('./../../../Actions/user.js');
  
  if(users.get(socket.usrId).token !== e.token) return;
  if(!(e.id in users.get_all())) return;

  let user = require('./../../../Actions/user').display_user(socket.usrId, e);

  socket.emit('Return User', user);
};