'use strict';

module.exports.clear_messages = () => {
  for(let chat in DB.chats) { 
    DB.chats[chat].messages = new Array();
  }

  require('./refresh')();
};

module.exports.clear_uploads = () => {
  const uploads = PATH.join(DIRNAME, 'Uploads');
  const folders = FS.readdirSync(uploads);
  const files = new Array();

  folders.forEach(folder => {
    if(folder.indexOf('.gitkeep') > -1) return;
    let f = dir => FS.readdirSync(PATH.join(uploads, dir));
    f(folder).forEach(file => {
      files.push(PATH.join(uploads, folder, file));
    });
  });

  files.forEach(file => {
    FS.unlinkSync(file);
  });
};