'use strict';

module.exports = (socket, e) => {
  if(typeof socket.chatChannel === 'undefined') return;

  require('./../../../Actions/message').delete(socket.chatChannel, socket.usrId, e);
  require('./../../../Helpers/emitsent')(SOCKET.IO.to(socket.chatChannel), socket.chatChannel);
};