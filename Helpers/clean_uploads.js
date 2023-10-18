'use strict';

module.exports = () => {
  const uploads = PATH.join(DIRNAME, 'Uploads');
  const folders = FS.readdirSync(uploads);
  const withLen = new Array();

  folders.forEach(folder => {
    if(folder.indexOf('.gitkeep') > -1) return;
    let folderFiles = FS.readdirSync(PATH.join(uploads, folder));
    withLen.push({len: folderFiles.length, f: PATH.join(uploads, folder)});
  });

  withLen.forEach(dir => {
    if(dir.len > 0) return;
    FS.rmdirSync(dir.f);
  });
};