'use strict';

const router = EXPRESS.Router();

SOCKET.IO.origins('*:*');

router.use(USERAGENT.express());
process.setMaxListeners(0);

router.use(BODYPARSER.json());
router.use(BODYPARSER.urlencoded({
  extended: true
}));

router.use(SIOFU.router);
router.use(DDOS.express);

router.use('/', EXPRESS.static(
  PATH.join(DIRNAME, 'Public')
));

router.use('/Uploads', EXPRESS.static(
  PATH.join(DIRNAME, 'Uploads')
));

router.get('/', (req, res) => {
  if(req.useragent.isIE) return res.send('<h1>Sorry, we do not support IE</h1>');
  res.redirect('/login');
}); 

router.get('/cls', (req, res) => {
  if(req.useragent.isIE) return res.send('<h1>Sorry, we do not support IE</h1>');
  require('./../Actions/util').clear_messages();
  res.send('<script>window.location = \'chat\';</script>');
  require('../Actions/util').clear_uploads();
});

// Views

router.get('/home', (req, res) => {
  if(req.useragent.isIE) return res.send('<h1>Sorry, we do not support IE</h1>');
  res.header('Access-Control-Allow-Origin: *');
  res.sendFile((PATH.join(DIRNAME, 'Views', 'login.html')));
});

router.get('/login', (req, res) => {
  if(req.useragent.isIE) return res.send('<h1>Sorry, we do not support IE</h1>');
  res.header('Access-Control-Allow-Origin: *');
  res.sendFile((PATH.join(DIRNAME, 'Views', 'login.html')));
});

router.get('/signup', (req, res) => {
  if(req.useragent.isIE) return res.send('<h1>Sorry, we do not support IE</h1>');
  res.header('Access-Control-Allow-Origin: *');
  res.sendFile((PATH.join(DIRNAME, 'Views', 'signup.html')));
});

router.get('/chat', (req, res) => {
  if(req.useragent.isIE) return res.send('<h1>Sorry, we do not support IE</h1>');
  res.header('Access-Control-Allow-Origin: *');
  res.sendFile((PATH.join(DIRNAME, 'Views', 'chat.html')));
});

module.exports = router;