'use strict';

let router = EXPRESS.Router();
const chats = require('../../Actions/chat');

const invites = chats.get_invites();
invites.forEach(invite => {
  router = require('./invite_listen')(router, invite);
});

module.exports = router;