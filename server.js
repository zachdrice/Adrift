'use strict';

global = Object.freeze(new require('./Helpers/globals.js')(__dirname));
require('./Helpers/clean_uploads')();

SOCKET.IO.on('connection', socket => {
  socket.emit('connection');
  require('./Controllers/Socket/socket-definitions')(socket);

  //#region Uploads
  const uploads = PATH.join('Uploads/');
  const now = Date.now();
  const name = `${socket.id}-${now}/`;
  const uploadPath = PATH.join(uploads, name);

  FS.mkdirSync(uploadPath);
  socket.uploadPath = name;
  socket.once('disconnect', () => {
    const len = FS.readdirSync(uploadPath).length;
    if(len > 0) return;
    FS.rmdirSync(uploadPath);
  });

  const uploader = new SIOFU();
  uploader.dir = uploadPath;
  uploader.listen(socket);
  //#endregion
});

require('./Actions/scramble_tokens')();

APP.use(require('./Controllers/routes'));
APP.use('/i', require('./Controllers/Invites/invites'));
APP.use('/api', require('./Controllers/API/api-definitions'));

SERVER.listen(PORT, () => console.log(`Server Started on port ${PORT}`));