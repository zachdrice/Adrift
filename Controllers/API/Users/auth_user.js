module.exports = (data, send) => {
  if(typeof data.username === 'undefined') {
    return send({success: false, error: 'Param: \'username\' is required'});
  }

  if(typeof data.password === 'undefined') {
    return send({success: false, error: 'Param: \'password\' is required'});
  }

  const login = require('./../../../Actions/auth').login(data.username, data.password);

  if(typeof login === 'string') return send({error: login});
  
  const user = login.users[login.index];

  send({
    token: user.token,
    id: user.id,
    currentChat: 'main'
  });
};