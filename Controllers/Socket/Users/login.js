'use strict';

module.exports = (socket, e) => {
  if(typeof e !== 'object') return;
  if(!('username' in e)) return;
  if(!('password' in e)) return;
  if(typeof e.username !== 'string') return;
  if(typeof e.password !== 'string') return;

  const login = require('./../../../Actions/auth').login(e.username, e.password);

  if(typeof login === 'string') return socket.emit(login);

  const users = login.users;
  const index = login.index;

  socket.emit('Logged In', users[index].token);

  socket.username = users[index].username;
  socket.usrId = users[index].id;
  socket.currentChat = 'main';
};