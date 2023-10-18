'use strict';

module.exports = (socket, e) => {
  const users = require('./../../../Actions/user.js');

  if(typeof socket.usrId === 'undefined') return;
  if(users.get(socket.usrId).token !== e.token) return;
  if(!(e.id in users.get_all())) return;
  
  let friend = require('./../../../Actions/user').get(e.id);
  
  if(!friend) return;
  if(friend.friends.indexOf(socket.usrId) === -1) return;

  let DMChannel = require('./../../../Actions/chat').load_dm(socket.usrId, e);

  if(typeof DMChannel === 'undefined') { 
    DMChannel = require('./../../../Actions/chat').create(socket.usrId, 'dm', [ socket.usrId, e.id ]);

    socket.join(DMChannel.id);

    if(typeof DMChannel === 'string') return; // Not properly handled
  }

  socket.chatChannel = DMChannel.id;

  socket.emit('DM ID', DMChannel.id);

  require('./../../../Helpers/emitsent')(socket, socket.chatChannel);
  return socket;
};