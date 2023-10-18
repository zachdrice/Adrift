'use strict';

module.exports.get_by_token = token => {
  let index = -1;
  const users = DB.users;
  let tokens = new Array();

  users.forEach(user => tokens.push(user.token));

  for(let key in tokens) {
    if(tokens[key] !== token) continue;
    index = key;
    break;
  }

  if(index === -1) return undefined;

  let user = new Object();
  for(let key in users[index]) {
    if(key === 'token') continue;
    if(key === 'password') continue;
    user[key] = users[index][key];
  }

  return user;
};

module.exports.get = id => DB.users[id];
module.exports.get_all = () => DB.users;

// Considering separate friend model
module.exports.friend_add = (usrId, e) => {
  for(let friend of DB.users[usrId].friends) {
    if(friend === e.id) return false;
  }

  DB.users[usrId].friends.push(e.id);
  DB.users[e.id].friends.push(usrId);

  require('./refresh')();
  return true;
};

module.exports.friend_remove = (usrId, e) => {
  let index1 = DB.users[usrId].friends.indexOf(e.to);    
  if(index1 === -1) return;
  DB.users[usrId].friends.splice(index1, 1);

  let index2 = DB.users[e.to].friends.indexOf(usrId);
  if(index2 === -1) return;
  DB.users[e.to].friends.splice(index2, 1);

  require('./refresh')();
};

module.exports.friend_get = id => {
  let friends = new Array();
  DB.users[id].friends.forEach(frID => {
    let friend = DB.users[frID];
    friends.push({
      username: friend.username,
      id: friend.id,
      created: friend.created
    });
  });

  return friends;
};

// NOTE: Tmp while models being rewritten
module.exports.display_user = (usrId, e) => {
  let DBUser = DB.users[e.id];
  let isFriend = false;
  let isOnline = false;

  for(let friend of DB.users[e.id].friends) {
    if(friend !== usrId) continue;
    isFriend = true;
    break;
  }

  for(let cSocket of Object.values(chatSockets)) {
    if(cSocket.id !== e.id) continue;
    isOnline = true;
    break;
  }

  let user = {
    name: DBUser.username,
    created: DBUser.created,
    id: DBUser.id,
    isFriend: isFriend,
    isOnline: isOnline,
    isSelf: e.id === usrId
  };

  return user;
};

module.exports.signup = e => {
  let username = e.username;
  let check = username.toLowerCase();
  let password = e.password;
  let hasher = require('./../Helpers/hash').password;
  let hash = hasher(password);

  let users = DB.users;
  let names = new Array();
  let inUse = false;

  users.forEach(user => names.push(user.username));
  names.forEach(name => {
    if(name.toLowerCase() === check) inUse = true;
  });

  if(inUse) return 'Username Taken';

  let user = {
    username: username,
    password: hash,
    created: String(new Date()),
    id: users.length,
    friends: new Array(),
    token: require('./../Helpers/genrandchars')(50)
  };

  DB.users = [...users, user];
  require('./refresh')();

  return user;
};