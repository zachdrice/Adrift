'use strict';

const router = EXPRESS.Router();
const mode = 'GET';

require('./../../Helpers/iterate_events')(__dirname, (event, dir) => {
  router.get(`/${event}`, (req, res, next) => {
    let data = mode === 'POST' ? res.body : (mode === 'GET' ? req.query : new Object());
    require(`./${dir}/${event}`)(data, x => res.send(JSON.stringify(x)), req, res, next);
  });
});

module.exports = router;