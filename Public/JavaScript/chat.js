const SocketIO = io.connect();
SocketIO.on('connection', () => SocketIO.emit('authenticate', {
  token: localStorage.getItem('token')
}));

let peer;
let streamVar;

function createElementFromHTML(htmlString) {
  let div = document.createElement('div');
  div.innerHTML = htmlString;

  return div.firstChild;
}

function createMsgBox(usr, usrID, sentTimestamp) {
  let msgBox = document.createElement('div');
  let sent = new Date(sentTimestamp);
  let msAgo = Date.now() - sentTimestamp;
  let dayWord = msAgo < 86400000 ? 'Today' : msAgo > 2 * 86400000 ? `${sent.getDate()}/${sent.getMonth() + 1}/${sent.getFullYear()}` : 'Yesterday';
  let msgInfo = createElementFromHTML(`<p class="msg-info"> <span class="msg-sent">${dayWord} at ${(sent.getHours() < 10 ? '0' : '') + sent.getHours()}:${(sent.getMinutes() < 10 ? '0' : '') + sent.getMinutes()}</span></p>`);
  let msgContainer = document.createElement('div');
  let msgUsr = createElementFromHTML(`<span class="msg-usr">${usr}</span>`);
  msgUsr.onclick = () => getUser(usrID);
  msgUsr.onmouseover = () => msgUsr.style.textDecoration = "underline";
  msgUsr.onmouseout = () => msgUsr.style.textDecoration = "";

  msgBox.className = 'msg-box';
  msgBox.id = `msg-box.${usrID}`;
  msgContainer.className = 'msg-container';

  msgInfo.insertAdjacentElement('afterbegin', msgUsr);
  msgBox.appendChild(msgContainer);
  msgBox.appendChild(msgInfo);
  return msgBox;
}

function createMsgContent(msg, id, byMe, isOwner, embed = new Array()) {
  let msgContent = document.createElement('div');
  let isRight = msg.indexOf('<font class="rightToLeft">') > -1;
  msgContent.className = 'msg-content';
  msgContent.id = `msg.${id}`;
  let msgText = createElementFromHTML(`<p class="msg-text">${msg}</p>`);
  msgText.style.display = 'inline-block';
  if(isRight) msgText.classList.add('rightParagraph');
  msgContent.appendChild(msgText);
  if(byMe || isOwner) {
    let msgActions = document.createElement('div');
    msgActions.className = 'msg-actions';
    msgActions.appendChild(createElementFromHTML(`<img src="img/trash.png" class="msg-button-delete" onclick="Javascript: DelMsg(${id});" />`));
    if(byMe) msgActions.appendChild(createElementFromHTML(`<img src="img/edit.png" class="msg-button-edit" onclick="Javascript: EditMsg(${id});" />`));
    msgContent.onmouseover = () => msgActions.style.display = 'inline-block';
    msgContent.onmouseout = () => msgActions.style.display = 'none';
    msgContent.appendChild(msgActions);
  }
  if(typeof embed[0] !== 'undefined') embed.forEach(emd => {
    if(emd.startsWith('yt:') === true) {
      let vidID = emd.replace('yt:','');
      pendingPlayers.push(`${id}:${vidID}`);
      let container = createElementFromHTML(`<div class="yt-container" id="yt-container${id}"></div>`);
      container.appendChild(createElementFromHTML(`<div class="yt-player" id="yt${id}"></div>`));
      msgContent.appendChild(container);
    }
  });

  return msgContent;
}

function createFriend(friend) {
  let friendBox = createElementFromHTML(`<div class="friend-box" id="friend.${friend.id}"></div>`);
  let friendInfo = createElementFromHTML(`<span class="friend-info"><span class="friend-username">${friend.username}</span><span class="friend-id">#${friend.id}</span></span>`);
  let friendButtons = createElementFromHTML('<div class="friend-buttons"></div>');
  let friendCall = createElementFromHTML('<img src="img/call.png" class="friend-call" />');
  let friendVideo = createElementFromHTML('<img src="img/video.png" class="friend-video" />')
  let friendDM = createElementFromHTML('<img src="img/dm.png" class="friend-dm" />');
  let friendRemove = createElementFromHTML('<img src="img/remove.png" class="friend-remove" />');

  friendBox.onmouseover = () => {
    friendButtons.style.display = 'block';
    friendBox.style.backgroundColor = '#f7f7f7';
  };
  friendBox.onmouseout = () => {
    friendButtons.style.display = 'none';
    friendBox.style.backgroundColor = 'transparent';
  };
  
  friendVideo.onmouseover = () => friendVideo.style.backgroundColor = '#FCEC80';
  friendVideo.onmouseout = () => friendVideo.style.backgroundColor = 'transparent';
  friendVideo.onclick = () => requestCall(friend);  

  friendCall.onmouseover = () => friendCall.style.backgroundColor = '#80fc97';
  friendCall.onmouseout = () => friendCall.style.backgroundColor = 'transparent';
  friendCall.onclick = () => {
      // return alert('TODO');

      SocketIO.emit('Call Request', {type: 'voice', token: localStorage.getItem('token'), to: friend.id});
      SocketIO.once('Call Res', res => {
        alert(res);
      });
  };
  
  friendDM.onmouseover = () => friendDM.style.backgroundColor = '#8097fc';
  friendDM.onmouseout = () => friendDM.style.backgroundColor = 'transparent';
  friendDM.onclick = () => {
    let id = friend.id;
    SocketIO.emit('Load DM', { token: localStorage.getItem('token'), id: id });
    SocketIO.once('DM ID', data => chatID = data);

    document.getElementById('chat-container').style.display = 'grid';
    document.getElementById('friends-container').style.display = 'none';
    document.getElementById('msg-area').style.display = 'fixed';
  };
  friendRemove.onmouseover = () => friendRemove.style.backgroundColor = '#fc5050';
  friendRemove.onmouseout = () => friendRemove.style.backgroundColor = 'transparent';
  friendRemove.onclick = () => {
    SocketIO.emit('Remove Friend', {token: localStorage.getItem('token'), to: friend.id});
    SocketIO.emit('Get Friends');
  };

  friendButtons.appendChild(friendRemove);
  friendButtons.appendChild(friendDM);
  friendButtons.appendChild(friendCall);
  friendButtons.appendChild(friendVideo);
  friendBox.appendChild(friendInfo);
  friendBox.appendChild(friendButtons);
  return friendBox;
}

let editID = -1;
let chatID = 0;
let isEditing = false;

let typingBox = false;
let currentOwner;

let mousePos = {x: 0, y: 0};

let isDeaf = false;
let isMute = false;

function DelMsg(id) {
  SocketIO.emit('Delete Message', {
    id: id,
    user: {token: localStorage.getItem('token')}
  });
}

function EditMsg(id) {
  editID = id;
  isEditing = true;

  let current = HTMLDecode(RemoveSpoiler(document.getElementById(`msg.${id}`).innerHTML
    .replace(/<b>/g, '**').replace(/<\/b>/g, '**')
    .replace(/<i>/g, '*').replace(/<\/i>/g, '*')
    .replace(/<sub>/g, '__').replace(/<\/sub>/g, '__')
    .replace(/<sup>/g, '^^').replace(/<\/sup>/g, '^^')
    .replace(/<spoil class="spoil">|<\/spoil>/g, '|')
    .replace(/<u>/g, '_',).replace(/<\/u>/g, '_')
    .replace(/<span style="text-decoration: line-through;">/g, '~')
    .replace(/<br \/>|<br>|<br\/>/g, '\n').replace(/<\/span>/g, '~')));

  document.getElementById('message').value = current;

  document.getElementById('edit').style.display = 'block';
  document.getElementById('cancel').style.display = 'block';
}

function createNotification(title, sub) {
  let notificationBox = createElementFromHTML('<div class="notification-box"></div>');
  let notificationTitle = createElementFromHTML(`<p class="notification-title">${title}</p>`);
  let notificationSub = createElementFromHTML(`<p class="notification-sub">${sub}</p>`);

  notificationBox.appendChild(notificationTitle);
  notificationBox.appendChild(notificationSub);    
  return notificationBox;
}

SocketIO.on('Invalid Token', () => {
  window.location = 'login'; 
});

SocketIO.on('Valid Token', e => {
  ytReady();

  let message = document.getElementById('message');
  let chat = document.getElementById('chat');
  let notifications = document.getElementById('notifications');
  let lastSent;

  SocketIO.emit('Chat Connection', {
    token: localStorage.getItem('token'),
    chat: chatID
  });

  SocketIO.on('Already Sent', data => {
    chat.innerHTML = new String();
    let lastUsr;
    data.forEach(msgObj => {
      if(typeof msgObj !== 'object') return;
      let msgElem;
      if(lastUsr === msgObj.user.name && msgObj.sent - lastSent <= 600000 && msgObj.sent - lastSent > 0) msgElem = chat.lastChild;
      else msgElem = createMsgBox(msgObj.user.name, msgObj.user.id, msgObj.sent);
      let embeds = manageEmbeds(msgObj.msg);
      msgElem.getElementsByClassName('msg-container')[0].appendChild(createMsgContent(msgObj.msg, msgObj.id, msgObj.user.name === e.username, msgObj.chatOwner === e.id, embeds))
      chat.appendChild(msgElem);
      lastUsr = msgObj.user.name;
      lastSent = msgObj.sent;
    });
    managePlayers();

    chat.scrollTop = chat.scrollHeight;
    manageSpoilers();
  });

  let friendsButton = document.getElementById('friends-button');
  let friendsContainer = document.getElementById('friends-container');
  let chatContainer = document.getElementById('chat-container');

  friendsButton.onclick = () => {
    chatContainer.style.display = 'none';
    friendsContainer.style.display = 'block';
    SocketIO.emit('Get Friends');
  };

  SocketIO.on('Friends', data => {
    SocketIO.emit('Friends Menu');
    let friends = document.getElementById('friends');
    friends.innerHTML = new String();

    data.forEach(fri => {
      friends.appendChild(createFriend(fri));
    });
  });

  SocketIO.on('Call Ended', type => {
    if(type === 'video') {
      document.getElementById('video-box').style.display = 'none';
    } else {
      
    }

    peer.close();
    peer = null;

    streamVar.getTracks().forEach(track => {
      track.enabled = false;
    });

    streamVar = null;
  });

  addCallListeners();  

  let interval;
  let img = document.getElementById('call-box').getElementsByTagName('img');
  
  img[0].onclick = () => {
    document.getElementById('call-box').style.display = 'none';
    SocketIO.emit('Call Response', 'accepted');
    clearInterval(interval);
  };

  img[1].onclick = () => {
    document.getElementById('call-box').style.display = 'none';
    SocketIO.emit('Call Response', 'denied');
    clearInterval(interval);
  };

  SocketIO.on('Call Request', e => {
    document.getElementById('call-box').style.display = 'block';
    document.getElementById('caller-name').textContent = e.from.name;
    document.getElementById('call-type-voice').style.display = 'none';
    document.getElementById('call-type-video').style.display = 'none';
    document.getElementById('call-type-' + e.type).style.display = 'block';
    interval = setTimeout(() => {
      SocketIO.emit('Call Response', 'ignored');
      document.getElementById('call-box').style.display = 'none';
    }, 1e4);
  });
  
  SocketIO.on('Refresh Chats', data => {
    let currentChat;
    let chats = document.getElementById('chats');
    let actions = document.getElementById('actions');
    actions.innerHTML = new String();
    chats.innerHTML = new String();
    for(let i in data) {
      if(data[i].type == "dm") continue;
      let chatButton = createElementFromHTML(`<h3 class="chat-button" id="chat-${data[i].id}-button">${data[i].name}</h3>`);
      if(data[i].id !== chatID) {
        chatButton.onmouseover = () => chatButton.style.backgroundColor = '#cecece';
        chatButton.onmouseout = () => chatButton.style.backgroundColor = 'transparent';
        chatButton.onclick = () => {
          chatID = data[i].id;
          SocketIO.emit('Chat Connection', {
            token: localStorage.getItem('token'),
            chat: data[i].id
          });
          chatContainer.style.display = 'grid';
          friendsContainer.style.display = 'none';
        };
        chatButton.ondblclick = () => createEditBox(data[i].id);
      } else {
        currentChat = data[i];
        chatButton.classList.add('sidebar-button-pressed');
      }
      chats.appendChild(chatButton);
    }

    let other = [
      createElementFromHTML('<h3 class="chat-button" id="chat-new-button">New</h3>'),
      createElementFromHTML('<h3 class="chat-button" id="chat-join-button">Join</h3>'),
    ];

    other[0].onclick = createCreateBox;
    other[1].onclick = createJoinBox;

    if(typeof currentChat !== 'undefined') {
      friendsButton.onmouseover = () => friendsButton.style.backgroundColor = '#cecece';
      friendsButton.onmouseout = () => friendsButton.style.backgroundColor = 'transparent';
      currentOwner = currentChat.owner;

      if(currentChat.type === 'private' && currentChat.owner === e.id) {
        let chatDelete = createElementFromHTML('<h3 class="chat-button" id="chat-delete-button">Delete</h3>');
        chatDelete.onclick = () => SocketIO.emit('Chat Delete', {
          chat: currentChat.id,
          token: localStorage.getItem('token')
        });
        other.push(chatDelete);
      }

      if(currentChat.type === 'private') {
        let chatInvite = createElementFromHTML('<h3 class="chat-button" id="chat-invite-button">Invite</h3>');
        chatInvite.onclick = () => {
          clipboard(currentChat.invite);
        };

        other.push(chatInvite);
      }
    }

    {for(let i of other) { 
      i.onmouseover = () => i.style.backgroundColor = '#cecece';
      i.onmouseout = () => i.style.backgroundColor = 'transparent';                          
      actions.appendChild(i);
    }}

    SocketIO.on('Chat in Use', () => {
      alert('A chat with this information already exists.');
    });

    SocketIO.on('No Chat Found', () => {
      alert('No chat with this information exists.');
      createJoinBox();
    });

    SocketIO.on('Already in Chat', () => {
      alert('You are already in this chat');
    });

    updateTextLang();
  });

  SocketIO.on('Chat Deleted', data => {
    if(data === chatID) chatID = 0;
    SocketIO.emit('Chat Connection', {
      token: localStorage.getItem('token'),
      chat: chatID
    });
  });

  SocketIO.on('Friend Request', ee => {
    let el = document.getElementById('friend-alert');
    el.style.display = 'block';
    document.querySelector('#friend-alert h2').innerHTML = `${ee.name} sent a friend request. <span id="friend-accept">Accept</span> or <span id="friend-reject">Reject</span>`;
    document.getElementById('friend-accept').onclick = () => {
      SocketIO.emit('Friend Respond', {
        id: ee.id,
        accepted: true,
        token: localStorage.getItem('token')
      });
      el.style.display = 'none';
    };

    document.getElementById('friend-reject').onclick = () => {
      SocketIO.emit('Friend Respond', {
        id: ee.id,
        accepted: false,
        token: localStorage.getItem('token')
      });

      el.style.display = 'none';
    };
  });

  SocketIO.on('Friend Response', res => {
    let el = document.getElementById('friend-alert');
    el.style.display = 'block';
    document.querySelector('#friend-alert h2').innerHTML = res + ' <span id="friend-bar-close">Close</span>';
  
    document.getElementById('friend-bar-close').onclick = () => {
      el.style.display = 'none';
    };
  });

  document.getElementById('logout').onclick = a => {
    a.preventDefault();
    localStorage.removeItem('token');
    SocketIO.emit('logout', e.id);
    window.location = 'home';
  };

  document.getElementById('edit').onclick = function() {
    if(typeof message.value !== 'string') return;
    if(message.value.replace(/ |\t|\n/g, new String()).length < 1) return;
  
    isEditing = false;
    SocketIO.emit('Edit Message', {
      user: {token: localStorage.getItem('token')},
      id: editID,
      new: message.value
    });

    this.style.display = 'none';
    document.getElementById('cancel').style.display = 'none';
    message.value = new String();
    editID = -1;
  };

  document.getElementById('cancel').onclick = function() {
    this.style.display = 'none';
    document.getElementById('edit').style.display = 'none';
    message.value = new String();
    editID = -1;
    isEditing = false;
  };

  SocketIO.on('New Message', data => {
    if(typeof data !== 'object' || !data) return;
    if(data.chat.id === chatID) {
      let lastMsg = (!chat.lastChild) ? new Object() : chat.lastChild;
      let scrolledBottom = chat.scrollTop >= (chat.scrollHeight - chat.clientHeight);
      let embeds = manageEmbeds(data.msg);
      let msgElem;
      if(lastMsg.id === `msg-box.${data.usr.id}` && data.sent - lastSent <= 600000 && data.sent - lastSent > 0) msgElem = lastMsg;
      else msgElem = createMsgBox(data.usr.name, data.usr.id, data.sent);
      msgElem.getElementsByClassName('msg-container')[0].appendChild(createMsgContent(data.msg, data.id, data.usr.name === e.username, currentOwner === e.id, embeds))
      chat.appendChild(msgElem);
      lastSent = data.sent;
      if(data.usr === e.username || scrolledBottom) {
        let time = 0.1;
        let per = (1000 * time) / (0.1 * (chat.scrollHeight - chat.scrollTop));
        let int = setInterval(() => {
          chat.scrollTop += 50;
          if(chat.scrollTop >= (chat.scrollHeight - chat.clientHeight)) clearInterval(int);
        }, per);
      }

      managePlayers();
      manageSpoilers();
    } else {
      notifications.appendChild(createNotification(data.msg, `${data.usr.name}, ${data.chat.name}`));
    }
  });

  SocketIO.on('User Count', users => {
    let usernames = new Array();
    {for(let ii in users) {
      let i = users[ii];
      usernames.push(`<li><span class="user-name" onclick="Javascript: getUser(${i.id});">${i.username}</span></li>`);
    }}

    document.getElementById('usr-count').textContent = Object.keys(users).length;

    document.getElementById('users').firstChild.innerHTML = usernames.join('\n');
  });

  let shiftDown = false;

  document.onkeydown = e => {
    switch(e.key) {
    case "Shift":
      shiftDown = true;
    case "Enter":
      if(!shiftDown && !isEditing) {
        e.preventDefault();
        if(typeof message.value !== 'string') return;
        if(message.value.replace(/ |\t|\n/g, new String()).length < 1) return;
        SocketIO.emit('Send Message', message.value);
        message.value = new String();
      } else if(!shiftDown) {
        e.preventDefault();
        document.getElementById('edit').onclick();
      }

      break;
    default: //(!typingBox ? message.focus : new Function())();
      if(typingBox) break;
      message.focus(); 
    }
  };

  document.onkeyup = e => {
    switch(e.key) {
    case "Shift":
      shiftDown = false;
    }
  }
});

function HTMLDecode(str) {
  let doc = new DOMParser().parseFromString(str, 'text/html');
  return doc.documentElement.textContent;
}

function RemoveSpoiler(str) {
  let newStr = new String();
  let isOpening = false;

  let chars = str.split(/(?!$)/u);
  let index = 0;

  while(index < str.length) {
    if(chars[index] === '<' && chars[index + 1] === 's' && chars[index + 2] === 'p') {
      isOpening = true;
      newStr += '|';
    } 
    
    if(!isOpening) newStr += str[index];

    if(isOpening && str[index] === '>') {
      isOpening = false;
    }

    index++;
  }

  return newStr;
}

function manageEmbeds(msg) {
  let embeds = new Array();

  let msgElem = document.createElement('div');
  msgElem.innerHTML = msg;
  let links = msgElem.getElementsByTagName('a');
  for(let i = 0; i < links.length; i++) {
    let test = links[i].href;
    if(!test) continue;
    let testL = test.toLowerCase();
    let videoID;
    let isYT = testL.indexOf('/youtube.') > -1 ||
               testL.indexOf('.youtube.') > -1 ||
               testL.indexOf('.youtu.be/') > -1 ||
               testL.indexOf('/youtu.be/') > -1;
  
    if(!isYT) continue;
    if(testL.indexOf('youtu.be') === -1) {
      if(testL.indexOf('watch') === -1) continue;
      if(test.indexOf('v=') === -1) continue;
      let afterV = test.split('v=')[1];
      let beforeGet = afterV.split('&')[0];
      if(beforeGet.length === 0) continue;
      videoID = beforeGet;
    } else {
      let withoutQ = test.split('?')[0];
      let slashes = withoutQ.split('/');
      let lastS = slashes[slashes.length - 1];
      if(lastS.length === 0) continue;
      videoID = lastS;
    }

    embeds.push(`yt:${videoID}`);
  }

  return embeds;
}

/*function BoxMove(e, boxID) {
  
  if(cursorLastX === undefined) {
    cursorLastX = e.clientX;
    cursorLastY = e.clientY;
    return;
  }
  
  let cursorDisplace = {
    x: e.clientX - cursorLastX,
    y: e.clientY - cursorLastY 
  };

  let box = document.getElementById(boxID);
  box.style.position = 'absolute';
  
  box.style.top = Math.max(10, Math.min(box.offsetTop + cursorDisplace.y, window.innerHeight - (box.offsetHeight + 10))) + 'px';
  box.style.left = Math.max(10, Math.min(box.offsetLeft + cursorDisplace.x, window.innerWidth - (box.offsetWidth + 10))) + 'px';
  
  cursorLastX = e.clientX;
  cursorLastY = e.clientY;
}

function ManageImageLinks() {
  let links = document.getElementsByClassName('sent-link');
  let imgLinks = new Array();

  {for(let i = 0; i < links.length; i++) {
    let test = links[i].href;
    let testL = test.toLowerCase();
    let extensions = ['png', 'jpg', 'jpeg', 'gif'];
    let isImage = false;

    console.log(`(${test}, ${testL})`);
    {for(let i of extensions) {
      if(!testL.endsWith('.' + i)) continue;
      isImage = true;
      break;
    }}

    if(isImage) imgLinks.push(links[i]);
  }}

  {for(let i of imgLinks) {
    i.onmouseover = () => {
      let isHovering = true;
      i.onmouseleave = () => {
        isHovering = false;
      };

      setTimeout(() => {
        if(!isHovering) return;
        generateIMGBox(i.href);
      }, 1.5e3);
    };
  }}
} */

function manageSpoilers() {
  let spoils = document.getElementsByClassName('spoil');
  for(let i = 0; i < spoils.length; i++) spoils[i].onclick = function() {
    let isOpen = this.style.backgroundColor.indexOf('999') > -1 || this.style.backgroundColor.indexOf('153') > -1;
    console.log(isOpen);
    console.log(this.style.backgroundColor);
    this.style.backgroundColor = isOpen ? '#3A3A3A' : '#999';
  };
}

window.onload = () => {
  let usrSettingsButton = document.getElementById('usr-settings-button');
  let usrSettingsBox = document.getElementById('usr-settings-box');

  usrSettingsButton.onclick = () => {
    typingBox = true;
    usrSettingsBox.style.display = 'grid';
    document.getElementById('block-layer').style.display = 'block';
  }

  let notifyButton = document.getElementById('notify-button');
  let notifyBox = document.getElementById('notify-box');
  let notifications = document.getElementById('notifications');

  notifyButton.onclick = () => {
    if(notifyBox.style.display !== 'grid') {
      notifyBox.style.display = 'grid';
    } else {
      notifyBox.style.display = 'none';
      notifications.innerHTML = new String();
    }
  }

  setInterval(() => {
    let all = document.getElementsByClassName('cabine');
    {for(i = 0; i < all.length; i++) {
      all[i].style.color = '#' + Math.floor(Math.random() * 16777215).toString(16);            
    }}
  }, 50);

  document.getElementById('upload').addEventListener('change', e => {
    let name = document.getElementById('upload').files[0].name;
    setTimeout(() => SocketIO.emit('File Upload', {
      name: name,
      token: localStorage.getItem('token')
    }), 1e3);
  });
  
  let uploader = new SocketIOFileUpload(SocketIO);
  uploader.listenOnInput(document.getElementById('upload'));
  
  let links = document.getElementById('header-links');
  let headStylesArr = ['position', 'zIndex', 'top', 'left', 'cssFloat', 'textAlign', 'display', 'backgroundColor', 'width', 'borderBottom'];
  let headStyles = new Object();
  let lAlign = links.align;

  {for(let i of headStylesArr) {
    headStyles[i] = links.style[i]
  }}

  let resizeEvent = () => {
    document.getElementById('usersBtn').style.display = 'none';
    document.getElementById('chatsBtn').style.display = 'none';

    let width = document.body.clientWidth;
    let headX = document.getElementById('mTitleTxt').offsetWidth + document.getElementById('header-links-inner').offsetWidth + usrSettingsBox.offsetWidth;

    console.log(`Window: ${width}\tHeader:${headX}`);

    if(headX > width - 180) {
      links.style.zIndex = '999';
      links.style.borderBottom = '5px solid #f1f1f1';
      links.style.width = '100vw';
      links.style.position = 'fixed';
      links.style.left = '0';
      links.style.top = links.style.cssFloat = new String();
      links.style.textAlign = links.align = 'center';
      links.style.display = 'block';
      links.style.backgroundColor = '#FFF';
      document.getElementById('links-title-br').style.display = 'block';
      document.getElementById('mainTitle').align = 'center';
    } else for(let i in headStyles) {
      links.style[i] = headStyles[i];
      links.align = lAlign;
      document.getElementById('mainTitle').align = 'left';
    }

    if(width < 1000) {
      document.getElementById('usersBtn').style.display = 'inline';

    }

    if(width < 600) {
      document.getElementById('chatsBtn').style.display = 'inline';
    }
  };

  resizeEvent();
  window.addEventListener('resize', resizeEvent);

  let userOpen = false;
  let chatsOpen = false;

  document.getElementById('usersBtn').onclick = () => {
    let container = document.getElementsByClassName('container');
    {for(let i = 0; i < container.length; i++) {
      container[i].style.getTemplateColumns = '200px 1fr';
      container[i].style.getTemplateRows = '80px 1fr';
    }}
  
    document.getElementsByClassName('sidebar-right')[0].style.display = 'inline';
    document.getElementsByClassName('sidebar-right')[0].style.gridColumn = chatsOpen ? '3' : '2';
    document.getElementsByClassName('content-center')[0].style.gridColumn = chatsOpen ? '2' : '1';
    userOpen = true;
  };

  document.getElementById('chatsBtn').onclick = () => {
    chatsOpen = true;
  };

  document.getElementsByClassName('content-center')[0].onclick = () => {

  };

  let browser = navigator.userAgent || navigator.vendor || window.opera;
  let isEdge = /Edge\/\d./i.test(browser);

  if(isMobile() || isEdge) {
    document.getElementById('chat').style.height = (window.innerHeight - document.getElementsByClassName('header')[0].clientHeight - document.getElementsByTagName('textarea')[0].clientHeight) + 'px';
    window.addEventListener('resize', () => {
      document.getElementById('chat').style.height = (window.innerHeight - document.getElementsByClassName('header')[0].clientHeight - document.getElementsByTagName('textarea')[0].clientHeight) + 'px';
    });
  }

  if(isMobile()) {
    document.getElementById('header-links').style.display = 'fixed';
    document.getElementsByClassName('header')[0].style.borderBottom = 'none';
    document.getElementById('uploadBtn').style.position = 'relative';
    document.getElementById('uploadBtn').style.top = '25px';
  }

  if(isEdge) {
    document.getElementsByClassName('content-center')[0].style.overflow = 'hidden';
    document.getElementById('upload-img').style.position = 'relative';
    document.getElementById('upload-img').style.top = '35px';
  }

  document.getElementById('create-close').onclick = () => {
    document.getElementById('create-box').style.display = 'none';
    document.getElementById('join-box').style.display = 'none';
    document.getElementById('block-layer').style.display = 'none';
    typingBox = false;
  };

  document.getElementById('join-close').onclick = document.getElementById('create-close').onclick;

  document.getElementById('deaf-video').style.display = 'inline';
  document.getElementById('mute-video').style.display = 'inline';

  document.getElementById('deaf-video').onclick = () => setVideoIcons('deaf', true);
  document.getElementById('mute-video').onclick = () => setVideoIcons('mute', true);
  document.getElementById('undeaf-video').onclick = () => setVideoIcons('deaf', false);
  document.getElementById('unmute-video').onclick = () => setVideoIcons('mute', false);

  function setVideoIcons(t, b) {
    if(t === 'deaf') isDeaf = b;
    else isMute = b;

    document.getElementById('deaf-video').style.display = !isDeaf ? 'inline' : 'none';
    document.getElementById('mute-video').style.display = !isMute ? 'inline' : 'none';
    document.getElementById('undeaf-video').style.display = isDeaf ? 'inline' : 'none';
    document.getElementById('unmute-video').style.display = isMute ? 'inline' : 'none';
  }

  document.getElementById('leave-vc').onclick = () => {
    SocketIO.emit('Leave Media Stream', 'video');
  };
};

function createCreateBox() {
  typingBox = true;  
  document.getElementById('create-type').checked = false;  

  document.getElementById('create-password').style.display = 'block';

  let inputs = document.getElementById('create-box').getElementsByTagName('input');
  {for(let i = 0; i < inputs.length; i++) {
    inputs[i].value = new String();
  }}

  document.getElementById('create-box').style.display = 'block';
  document.getElementById('block-layer').style.display = 'block';
  document.getElementById('create-button').onclick = () => {
    let data = {
      public: document.getElementById('create-type').checked,
      name: document.getElementById('create-name').value,
      password: document.getElementById('create-password').value,
      token: localStorage.getItem('token')
    };

    SocketIO.emit('Chat Creation', data);
    document.getElementById('create-close').onclick();
  };

  document.getElementById('create-type').onclick = () => {
    if(document.getElementById('create-type').checked) {
      document.getElementById('create-password').style.display = 'none';
    } else {
      document.getElementById('create-password').style.display = 'block';
    }
  }; 
}

function createJoinBox() {
  typingBox = true;
  document.getElementById('join-box').style.display = 'block';
  document.getElementById('block-layer').style.display = 'block';

  let inputs = document.getElementById('join-box').getElementsByTagName('input');
  {for(let i = 0; i < inputs.length; i++) {
    inputs[i].value = new String();
  }}

  document.getElementById('join-button').onclick = () => {
    let data = {
      name: document.getElementById('join-name').value,
      password: document.getElementById('join-password').value,
      token: localStorage.getItem('token')
    };

    SocketIO.emit('Join Chat', data);
    document.getElementById('create-close').onclick();
  };
}

function createEditBox() {
  
}

function getUser(id) {
  SocketIO.emit('Get User', {id: id, token: localStorage.getItem('token')});
  SocketIO.once('Return User', user => {
    document.getElementById('user-add').style.display = 'none';
    document.getElementById('user-remove').style.display = 'none';
    document.getElementById('user-isfriend').style.display = 'none';

    if(mousePos.x < window.innerWidth / 2) {
      document.getElementById('user-box').style.left = (mousePos.x + 3) + 'px';
      document.getElementById('user-box').style.right = new String();
    } else {
      document.getElementById('user-box').style.right = (window.innerWidth - mousePos.x - 3) + 'px';
      document.getElementById('user-box').style.left = new String();
    }

    if(mousePos.y < window.innerHeight / 2) {
      document.getElementById('user-box').style.top = (mousePos.y + 3) + 'px';
      document.getElementById('user-box').style.bottom = new String();
    } else {
      document.getElementById('user-box').style.bottom = (window.innerHeight - mousePos.y - 3) + 'px';
      document.getElementById('user-box').style.top = new String();
    }

    document.getElementById('user-name').textContent = user.name;
    document.getElementById('user-created').textContent = String(new Date(user.created));
    document.getElementById('user-box').style.display = 'block';
    
    if(user.isFriend) document.getElementById('user-isfriend').style.display = 'block';
    if(!user.isFriend && user.isOnline && !user.isSelf) {
      document.getElementById('user-add').style.display = 'block';  
    }else if(user.isFriend) {
      document.getElementById('user-remove').style.display = 'block';  
    }

    let onClick = () => {
      document.getElementById('user-box').style.display = 'none';
      document.removeEventListener('click', onClick);
    };

    document.addEventListener('click', onClick);
    document.getElementById('user-add').onclick = () => {
      SocketIO.emit('Friend Request', {token: localStorage.getItem('token'), to: user.id});
    };

    document.getElementById('user-remove').onclick = () => {
      SocketIO.emit('Remove Friend', {token: localStorage.getItem('token'), to: user.id});
    };
  });
}

function isMobile() {
  let check = false;
  (function(a) {if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}

function clipboard(str) {
  let el = document.createElement('textarea');
  el.value = str;
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
}

window.addEventListener('mousemove', e => {
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;
});