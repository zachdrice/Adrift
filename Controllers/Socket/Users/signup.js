'use strict';

module.exports = (socket, e) => {
  if(typeof e !== 'object') return;
  if(!('username' in e)) return;
  if(!('password' in e)) return;
  if(typeof e.username !== 'string') return;
  if(typeof e.password !== 'string') return;
  
  const user = require('./../../../Actions/user').signup(e);
  if(typeof user === 'string') return socket.emit(user);
  socket.emit('Signup Success', user.token);
};