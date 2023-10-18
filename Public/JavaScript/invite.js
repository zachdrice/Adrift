const pageTitle = 'invite';
const SocketIO = io.connect();

SocketIO.on('connection', () => SocketIO.emit('authenticate', {
  token: localStorage.getItem('token')
}));

SocketIO.on('Invalid Token', () => {
  window.location = '../login?invite=' + invite;
});

SocketIO.on('Valid Token', () => {
  SocketIO.emit('Get Chat', invite);
});

SocketIO.on('Recieved Chat', chat => {
  if(!chat.isValid) return;
  if(chat.inChat) {
    window.location = '../chat';
    return;
  }

  document.getElementsByTagName('h1')[0].textContent = chat.name;
  document.getElementById('created').textContent = new Date(chat.created).toDateString();
  document.getElementById('owner-name').textContent = chat.owner;
  document.getElementById('member-count').textContent = String(chat.members);
});

document.getElementsByTagName('button')[0].onclick = () => {
  SocketIO.emit('Join Chat', {invite, token: localStorage.getItem('token')});
};

SocketIO.on('Joined from Invite', () => {
  window.location = '../chat';
});

document.getElementById('return').onclick = () => window.location = '../chat';