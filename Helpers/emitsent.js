'use strict';

module.exports = (socket, chatKey) => {
  const chats = require('./../Actions/chat');
  const chat = chats.get(chatKey);

  const msgs = chat.messages;
  const chatOwner = chat.owner;

  for(let msgKey in msgs) {
    if(typeof msg !== 'object') continue;
    msgs[msgKey].chatOwner = chatOwner;
  }

  socket.emit('Already Sent', msgs);
};