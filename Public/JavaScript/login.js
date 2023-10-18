const pageTitle = 'login';
const SocketIO = io.connect();
document.getElementsByTagName('button')[0].onclick = () => {
  let username = document.getElementById('username').value;
  let password = document.getElementById('password').value;
  SocketIO.emit('login', {
    username: username,
    password: password
  });
};

let toSet = 'chat';

SocketIO.emit('authenticate', {
  token: localStorage.getItem('token')
});

SocketIO.on('Valid Token', () => {
  window.location = 'chat';
});

SocketIO.on('Invalid Credentials', () => {
  alert('Invalid username & password combination.');
});

SocketIO.on('Logged In', token => {
  localStorage.setItem('token', token);
  window.location = toSet;
});

document.onkeydown = e => {
  if((e.which || e.keyCode) !== 13) return;
  if(document.getElementById('username').value.length === 0) {
    document.getElementById('username').focus();
  } else if(document.getElementById('password').value.length === 0) {
    document.getElementById('password').focus();
  }else {    
    document.getElementsByTagName('button')[0].onclick();
  }
};

let url = window.location.href;
let isLink = url.indexOf('invite=') > -1;
if(isLink) {
  let afterGET = url.split('invite=')[1];
  let invite = afterGET.split('&')[0];
  toSet = 'i/' + invite;

  document.getElementsByTagName('a')[0].onclick = function(e) {
    e.preventDefault();
    window.location = `${this.href}?invite=${invite}`;
    return false;
  };
}