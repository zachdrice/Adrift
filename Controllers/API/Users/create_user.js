module.exports = (data, send) => {
  if(typeof data.username === 'undefined') {
    return send({success: false, error: 'Param: \'username\' is required'});
  }

  if(typeof data.password === 'undefined') {
    return send({success: false, error: 'Param: \'password\' is required'});
  }

  let user = require('./../../../Actions/user').signup({
    username: data.username,
    password: data.password
  });

  if(typeof user === 'string') send({success: false, error: user});
  else send({success: true, token: user.token})
};