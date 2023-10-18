'use strict';

module.exports = (socket, e) => {
  if(typeof socket.usrId === 'undefined') return;

  require('./../../../Actions/message').edit(e, socket.chatChannel);
  require('./../../../Helpers/emitsent')(SOCKET.IO.to(socket.chatChannel), socket.chatChannel);
};