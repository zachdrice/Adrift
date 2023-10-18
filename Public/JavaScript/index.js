const SocketIO = io.connect();
SocketIO.emit('authenticate', {
  token: localStorage.getItem('token')
});

SocketIO.on('Invalid Token', () => {
  document.title = 'Welcome | Adrift';
  document.getElementById('logged').innerHTML = 'You are not logged in!';
});

SocketIO.on('Valid Token', e => {
  document.title = `Welcome ${e.username} | Adrift`;
  document.getElementById('logged').innerHTML = 'You are logged in!';
});