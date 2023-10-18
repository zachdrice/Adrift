'use strict';

module.exports = (socket, e) => {
  const users = require('./../../../Actions/user.js');

  if(users.get(socket.usrId).token !== e.token) return;
  if(!(e.to in users.get_all())) return;

  require('./../../../Actions/user').friend_remove(socket.usrId, e);
};