'use strict';

module.exports.login = (username, password) => {
  const check = username.toLowerCase();
  const hash = require('../Helpers/hash').password(password);

  const users = DB.users;
  const names = new Array();
  let index = -1;

  users.forEach(user => names.push(user.username));

  for(let nameKey in names) {
    if(names[nameKey].toLowerCase() !== check) continue;
    index = nameKey;
    break;
  }

  if(index === -1) return 'Invalid Credentials';
  if(users[index].password !== hash) return 'Invalid Credentials';

  return {users, index};
};