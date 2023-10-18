'use strict';

module.exports = () => {
  FS.writeFileSync(PATH.join(DIRNAME, 'DB', 'chats.json'), JSON.stringify({chats: DB.chats}, null, 2));
  FS.writeFileSync(PATH.join(DIRNAME, 'DB', 'users.json'), JSON.stringify({users: DB.users}, null, 2));
  FS.writeFileSync(PATH.join(DIRNAME, 'DB', 'static.json'), JSON.stringify({static: DB.static}, null, 2));
};