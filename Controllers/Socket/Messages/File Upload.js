'use strict';

module.exports = (socket, e) => {
  const name = e.name, token = e.token;

  const HTMLEntities = require('./../../../Helpers/htmlentities');
  const chats = require('./../../../Actions/chat.js');
  let user = require('./../../../Actions/user').get_by_token(token);

  if(typeof user === 'undefined') return;
  if(socket.usrId !== user.id) return;

  const src = PATH.join(DIRNAME, 'Uploads', socket.uploadPath, name);
  const chat = chats.get(socket.chatChannel);
  const interval = setInterval(() => {
    if(!FS.existsSync(src)) return;

    let msg = `Upload: <a href="${src.replace(/"/g, '\\"')}" class="sent-link" download>[${HTMLEntities(name)}]</a>`;
    SOCKET.IO.to(socket.chatChannel).emit('New Message', {
      msg,
      usr: {
        name: socket.username,
        id: socket.usrId
      },
      chat: {
        name: chat.name,
        id: chat.id
      },
      id: chat.messages.length,
      sent: Date.now()
    });

    require('./../../../Actions/message').send(socket.chatChannel, socket.username, socket.usrId, msg, false);

    clearInterval(interval);
  }, 1e2);
};