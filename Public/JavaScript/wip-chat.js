const SocketIO = io.connect('');
SocketIO.emit('authenticate', {
  token: localStorage.getItem('token')
});

let editID = -1;
let isEditing = false;
let ChatID = -1;

let typingBox = false;
let currentOwner;

let mousePos = {x: 0, y: 0};

function DelMsg(id) {
  SocketIO.emit('Delete Message', {
    id: id,
    user: {token: localStorage.getItem('token')}
  });
}

function EditMsg(id) {
  editID = id;
  isEditing = true;

  let current = HTMLDecode(document.getElementById(`msg.${id}`).innerHTML
    .replace(/<b>/g, '**').replace(/<\/b>/g, '**')
    .replace(/<i>/g, '*').replace(/<\/i>/g, '*')
    .replace(/<u>/g, '_',).replace(/<\/u>/g, '_')
    .replace(/<span style="text-decoration: line-through;">/g, '~')
    .replace(/<br \/>|<br>|<br\/>/g, '\n').replace(/<\/span>/g, '~'));

  document.getElementById('message').value = current;

  document.getElementById('edit').style.display = 'block';
  document.getElementById('cancel').style.display = 'block';
}

function loadView(id) {
  if(id === -1) {
    // Load friends view
  } else {
    // Load specified chat
  }
}

SocketIO.on('Invalid Token', () => {
  window.location = 'login'; 
});

SocketIO.on('Valid Token', e => {

  let chats = document.getElementById('chats');
  let friends = document.getElementById('friends');

  e.chats.forEach(chat => chats.appendChild(createChatBtn(chat.id)));
  e.friends.forEach(friend => friends.appendChild(createFriend(friend)));

  SocketIO.on('Chat Modify', data => {
    if(data.action === 0 ) {
      chats.removeChild(document.getElementById(`chat.${data.chat.id}`));
    } else if(data.action === 1) {
      chats.appendChild(createChatBtn(data.chat.id));
    } else if(data.action === 2) {
      console.log('Modify');
    }
  });
});

function HTMLDecode(str) {
  let doc = new DOMParser().parseFromString(str, 'text/html');
  return doc.documentElement.textContent;
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

window.onload = () => {

  let usrSettingsButton = document.getElementById('usr-settings-button');
  let usrSettingsBox = document.getElementById('usr-settings-box')

  usrSettingsButton.onclick = () => {
    typingBox = true;
    usrSettingsBox.style.display = 'grid';
    document.getElementById('block-layer').style.display = 'block';
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

  if(isMobile()) {
    window.addEventListener('resize', () => {
      document.getElementById('chat').style.height = (window.innerHeight - document.getElementsByClassName('header')[0].clientHeight - document.getElementsByTagName('textarea')[0].clientHeight) + 'px';
    });

    document.getElementById('header-links').style.display = 'fixed';
    document.getElementsByClassName('header')[0].style.borderBottom = 'none';
    document.getElementById('uploadBtn').style.position = 'relative';
    document.getElementById('uploadBtn').style.top = '25px';
  }

  document.getElementById('create-close').onclick = () => {
    document.getElementById('create-box').style.display = 'none';
    document.getElementById('join-box').style.display = 'none';
    document.getElementById('block-layer').style.display = 'none';
    typingBox = false;
  };

  document.getElementById('join-close').onclick = document.getElementById('create-close').onclick;
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
  var check = false;
  (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
  return check;
}

window.addEventListener('mousemove', e => {
  mousePos.x = e.clientX;
  mousePos.y = e.clientY;
});

function createElementFromHTML(htmlString) {
  let div = document.createElement('div');
  div.innerHTML = htmlString;

  return div.firstChild;
}

function createEmbed() {
  let embedPickDisp = document.createElement('div');
  let pickDispContent = createElementFromHTML('<span>Content Availaible: display <span id="text-button">here</span> or <span id="text-button">in box</span></span>')
  embedPickDisp.appendChild(pickDispContent);

  embedPickDisp.className = 'embed-pickDisp';

  return embedPickDisp;
}

function createMsgBox(usr, usrID) {
  let msgBox = document.createElement('div');
  let msgUsr = createElementFromHTML(`<p class="msg-usr">${usr}</p>`);
  let msgContainer = document.createElement('div');
  msgUsr.onclick = () => getUser(usrID);
  msgUsr.onmouseover = () => msgUsr.style.textDecoration = "underline";
  msgUsr.onmouseout = () => msgUsr.style.textDecoration = "";

  msgBox.className = 'msg-box';
  msgBox.id = `msg-box.${usrID}`;
  msgContainer.className = 'msg-container';

  msgBox.appendChild(msgContainer);
  msgBox.appendChild(msgUsr);
  return msgBox;
}

function createMsgContent(msg, id, byMe, embed = new Array(), isOwner) {
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
  if(embed[0] !== undefined) {
    embed.forEach(emd => {
      if(emd.startsWith('yt:') === true) {
        let vidID = emd.replace('yt:','');
        pendingPlayers.push(`${id}:${vidID}`);
        let container = createElementFromHTML(`<div class="yt-container" id="yt-container${id}"></div>`);
        container.appendChild(createElementFromHTML(`<div class="yt-player" id="yt${id}"></div>`));
        msgContent.appendChild(container);
      }
    });
  }
  return msgContent;
}

function createFriend(friend) {
  let friendBox = createElementFromHTML(`<div class="friend-box" id="friend.${friend.id}"></div>`);
  let friendInfo = createElementFromHTML(`<span class="friend-info"><span class="friend-username">${friend.username}</span><span class="friend-id">#${friend.id}</span></span>`);
  let friendButtons = createElementFromHTML('<div class="friend-buttons"></div>');
  let friendDM = createElementFromHTML('<img src="img/dm.png" class="friend-dm">');
  let friendRemove = createElementFromHTML('<img src="img/remove.png" class="friend-remove">');

  friendBox.onmouseover = () => {
    friendButtons.style.display = 'block';
    friendBox.style.backgroundColor = '#f7f7f7';
  };
  friendBox.onmouseout = () => {
    friendButtons.style.display = 'none';
    friendBox.style.backgroundColor = 'transparent';
  };
  friendDM.onmouseover = () => friendDM.style.backgroundColor = '#8097fc';
  friendDM.onmouseout = () => friendDM.style.backgroundColor = 'transparent';
  friendDM.onclick = () => {
    let id = friend.id;
    SocketIO.emit('Load DM', {token: localStorage.getItem('token'), id: id});
  
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
  friendBox.appendChild(friendInfo);
  friendBox.appendChild(friendButtons);
  return friendBox;
}

function createChatBtn(id) {
  let chatButton = createElementFromHTML(`<div class="sidebar-button" id="chat.${id}"></div>`);

  chatButton.onmouseover = () => {
    if(ChatID !== id) chatButton.style.backgroundColor = 'cecece';
  };
  chatButton.onmouseout = () => {
    if(ChatID !== id) chatButton.style.backgroundColor = 'transparent';
  };
  chatButton.onclick = () => {
    if(ChatID !== id) loadView(id);
  };

  return chatButton;
}