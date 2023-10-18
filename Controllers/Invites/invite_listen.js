'use strict';

module.exports = (router, invite) => {
  router.get('/' + invite, (req, res) => {
    const file = FS.readFileSync(PATH.join(DIRNAME, 'Views', 'invite.html'), 'utf8');
    res.send(file.replace(/%INVITE_CODE%/g, invite));
  });

  return router;
};