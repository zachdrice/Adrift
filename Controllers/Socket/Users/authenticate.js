'use strict';

module.exports = (socket, e) => {
  if(typeof e !== 'object') return;
  if(!('token' in e)) return socket.emit('Invalid Token');
  if(typeof e.token !== 'string') return socket.emit('Invalid Token');

  let user = require('./../../../Actions/user').get_by_token(e.token);
  if(typeof user === 'undefined') return socket.emit('Invalid Token');
  
  /*delete user.password;
  delete user.token;*/

  socket.username = user.username;
  socket.usrId = user.id;

  socket.emit('Valid Token', user);
  return socket;
};