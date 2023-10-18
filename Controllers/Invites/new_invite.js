'use strict';

module.exports = invite => {
  const router1 = EXPRESS.Router();
  const router2 = require('./invite_listen')(router1, invite);

  APP.use('/i', router2);
};