'use strict';

module.exports.send = (chatChannel, username, usrId, data, sanitize = true) => {
  const Format = require('../Helpers/formatter');
  const HTMLEntities = sanitize ? require('../Helpers/htmlentities') : x => x;

  DB.chats[chatChannel].messages.push({
    user: {id: usrId, name: username},
    msg: Format(HTMLEntities(data)),
    id: DB.chats[chatChannel].messages.length,
    sent: Date.now()
  });
  
  require('./refresh')();
};

module.exports.delete = (chatChannel, usrId, e) => {
  if(!(e.id in DB.chats[chatChannel].messages)) return;
  if(e.user.token !== DB.users[DB.chats[chatChannel].messages[e.id].user.id].token &&
  DB.chats[chatChannel].owner !== usrId) return;

  const msg = String(DB.chats[chatChannel].messages[e.id].msg);
  DB.chats[chatChannel].messages[e.id] = 'Deleted Message';
  
  require('./refresh')();

  if(msg.indexOf('Upload: <a href="Uploads/') === -1) return;
  let src = msg.split('"')[1];
  try { FS.unlinkSync(src); } catch(err) {}
};

module.exports.edit = (e, chatChannel) => {
  if(e.user.token !== DB.users[DB.chats[chatChannel].messages[e.id].user.id].token) return;
  if(e.new.replace(/ |\t|\n/g, new String()).length < 1) return;

  const Format = require('./../Helpers/formatter');
  const HTMLEntities = require('./../Helpers/htmlentities');
  
  DB.chats[chatChannel].messages[e.id].msg = Format(HTMLEntities(e.new));

  require('./refresh')();
};