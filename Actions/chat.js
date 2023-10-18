'use strict';

module.exports.create = (creator, type, users, name, password) => {
  if(!(type === 'public' || type === 'private' || type === 'dm')) return 'Invalid Type';

  let count = 0;
  const created = Date.now();

  for(let id in DB.chats) {
    if(id.startsWith(created)) count++;
  }

  count = String(count);
  while(count.length < 4) { count = `0${count}`; }

  let id = String(created) + count;
  
  const chat = {
    id, type,
    owner: creator,
    messages: new Array(),
    created
  }

  if(type !== 'public') chat.users = users;
  
  if(type !== 'dm') chat.name = name;

  if(type === 'private') {
    const chars = require('./static').get('urlChars');
    const rchars = require('./../Helpers/genrandchars')(6, chars);
    chat.invite = rchars;

    chat.password = require('./../Helpers/hash').password(password);
  }
  
  DB.chats[id] = chat;
  require('./refresh')();

  return chat;
};

module.exports.delete = (usrId, data) => {
  let chat, chatKey;

  for(let id in DB.chats) {
    if(typeof DB.chats[id] !== 'object') continue;
    if(data.chat !== id) continue;

    chat = DB.chats[id];
    chatKey = id;
    break;
  }

  if(typeof chat === 'undefined') return;
  if(chat.owner !== usrId) return;
  
  const updated = new Object();

  for(let id in DB.chats) {
    if(id === chatKey) continue;
    updated[id] = DB.chats[id];
  }

  DB.chats = updated;

  require('./refresh')();
  return chat;
};

module.exports.get_all = () => DB.chats;

function get_single(id) {
  let chat;
  
  for(let tag in DB.chats) {
    if(tag !== id) continue;
    chat = DB.chats[tag];
    break;
  }

  return chat;
}

function get_plural(ids) { // NOTE: Never actually used
  const chats = new Object();

  ids.forEach(id => {
    chats[id] = get_single(id);
  });

  return chats;
}

module.exports.get = e => {
  const get_func = typeof e === 'object' ? get_plural : get_single;
  return get_func(e);
};

module.exports.get_by_invite = invite => {
  let chat;

  for(let chatObj of Object.values(DB.chats)) {
    if(chatObj.type !== 'private') continue;
    if(chatObj.invite !== invite) continue;

    chat = chatObj;
    break;
  }

  return chat;
};

module.exports.join_by_invite = (usrId, invite) => {
  const me = module.exports;
  const chat = me.get_by_invite(invite);
  const tag = chat.id;
  DB.chats[tag].users.push(usrId);
  require('./refresh')();
};

module.exports.get_invites = () => {
  const invites = new Array();
  for(let chat of Object.values(DB.chats)) {
    if(chat.type !== 'private') continue;
    invites.push(chat.invite);
  }

  return invites;
};

module.exports.add_user = (usrId, socketId, e) => {
  let index;
  for(let id in DB.chats) {
    let chat = DB.chats[id];
    if(typeof chat !== 'object') continue;
    if(chat.type !== 'private') continue;
    if(chat.name.toLowerCase() !== e.name.toLowerCase()) continue;
    if(chat.password !== require('./../Helpers/hash').password(e.password)) continue;
    index = id;
    break;
  }

  if(typeof index === 'undefined') {
    return 'No Chat Found';
  }

  const chat = DB.chats[index];
  let inChat = false;

  for(let user of chat.users) {
    if(user !== usrId) continue;
    inChat = true;
    break;
  }

  if(inChat) {
    return 'Already in Chat';
  }

  DB.chats[index].users.push(usrId);
  chatSockets[socketId].chats[index] = DB.chats[index];
  require('./refresh')();
};

module.exports.load_dm = (usrId, e) => {
  const ids = [e.id, usrId];
  let DMChannel;

  for(let chat of Object.values(DB.chats)) {
    if(chat.type !== 'dm') continue;
    if(chat.users.indexOf(ids[0]) === -1 || chat.users.indexOf(ids[1]) === -1) continue;
    DMChannel = chat;
    break;
  }

  return DMChannel;
};