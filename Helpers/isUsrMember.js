'use strict';

module.exports = (chat, usrId) => {
  let inChat = false; 

  if(chat.type === 'public') return true;

  if(chat.type === 'private') for(let user of chat.users) {
    if(user !== usrId) continue;
    inChat = true;
    break;
  }

  if(chat.type === 'dm') {
    if(chat.users.indexOf(usrId) === -1) return false;
    inChat = true;
  }

  if(inChat) return true;
  return false;
};