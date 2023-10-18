'use strict';

module.exports = () => {
  const users = DB.users;
  for(let usr in users) users[usr].token = require('./../Helpers/genrandchars')(50);
  DB.users = users;
  require('./refresh')();
};