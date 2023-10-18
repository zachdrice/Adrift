const pageTitle = 'signup';
const SocketIO = io.connect();
document.getElementsByTagName('button')[0].onclick = () => {
  let username = document.getElementById('username').value;
  let password = document.getElementById('password').value;
  let confirm = document.getElementById('confirm').value;

  if(confirm !== password) return alert('Passwords do not match');

  SocketIO.emit('signup', {
    username: username,
    password: password
  });
};

let toSet = 'chat';

SocketIO.on('Username Taken', () => {
  alert('Username Taken');
});

SocketIO.on('Signup Success', token => {
  localStorage.setItem('token', token);
  window.location = toSet;
});

document.onkeydown = e => {
  if((e.which || e.keyCode) !== 13) return;

  let inputs = document.getElementsByTagName('input');
  let allFilled = true;

  for(let ii = 0; ii < inputs.length; ii++) {
    let input = inputs[ii];
    if(input.value.length === 0) {
      allFilled = false;
      input.focus();
      break;
    }
  }

  if(!allFilled) return;
  document.getElementsByTagName('button')[0].onclick();
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