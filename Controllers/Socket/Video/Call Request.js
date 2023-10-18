'use strict';

module.exports = (socket, e) => {
  const users = require('./../../../Actions/user.js');

  if(typeof socket.usrId === 'undefined') return; // Makes sure user is logged in
  if(typeof e !== 'object') return; // Protects against dummy requests
  if(typeof e.to !== 'number') return; // Protects against dummy requests
  if(typeof e.type !== 'string') return; // Protects against dummy requests
  
  const self = users.get(socket.usrId);

  if(self.token !== e.token) return; // Protects against dummy requests
  if(e.type !== 'voice' && e.type !== 'video') return; // Protects against dummy requests
  if(self.friends.indexOf(e.to) === -1) return; // Makes sure users are friends

  const inCool = callCooldown.filter(x => x !== 'DEL').filter(x => x.id !== socket.usrId).length > 0; // Looks if user is in cool-down queue
  if(inCool) {
    let s = Math.min(10, Math.ceil((Date.now() - callCooldown.filter(x => x !== 'DEL').filter(x => x.id !== socket.usrId)[0].started) / 1e3)); // Gets seconds left before they can start a new call
    return socket.emit('Call Res', `You must wait ${s} more second${s !== 1 ? 's' : new String()} to start a new call.`); // Tells client1 that the server denied their request and that they must wait {s} seconds
  }

  const coolIndex = callCooldown.length; // Gets length of cooldown queue
  callCooldown.push({
    id: socket.usrId, // User ID of client1
    start: Date.now(), // Current unix time
    timeout: setTimeout(() => {callCooldown[coolIndex] = 'DEL';}, 1e4) // Timeout to remove user from cooldown queue
  }); // Adds user to cool down queue

  const selfInCall = callPairs.filter(pair => pair.indexOf(socket.usrId) > -1).length > 0; // Detects if client1 aleady in a call
  if(selfInCall) return socket.emit('Call Res', 'You are already in a call.'); // Tells client1 the server denied their request because they're already in a call
  const otherInCall = callPairs.filter(pair => pair.indexOf(e.to) > -1).length > 0; // Detects if client2 is already in a call
  if(otherInCall) return socket.emit('Call Res', 'This user is already in a call.'); // Tells client1 the server denied their request because client2 is already in a call

  let online = false; // If client2 is online
  let firstSocket; // First websocket of client2

  for(let id in chatSockets) { // Loops through online sockets, changing the online variable if they are included
    if(chatSockets[id].id !== e.to) continue;
    online = true;
    firstSocket = chatSockets[id].socket;
    break;
  }

  if(!online) return socket.emit('Call Res', 'This user is not online.'); // Tells client1 their request was denied because client2 is offline
  firstSocket.emit('Call Request', {from: {id: socket.usrId, name: self.username}, type: e.type}); // Asks client2 if they want to join a call

  let emitters = [['Call Response', res => { // When client2 answers above request
    onResponse();
    const ress = ['accepted', 'denied', 'ignored']; // Possible responses
    let valid = false;
    ress.forEach(r => {
      if(r !== res) return;
      valid = true;
    }); // Makes sure response is valid

    if(!valid) return socket.emit('Call Res', 'User sent back invalid response.'); // Tells client1 there was an error
    socket.emit('Call Res', `Your call was ${res}.`); // Tells client1 their call was {res}
    if(res === 'accepted') { // Detects if call was accepted by client2
      const pairIndex = callPairs.length; // Gets index of newly added pair
      callPairs.push([socket.usrId, e.to]); // Pairs client1 and client2 together
      socket.once('Leave Media Stream', endStream); // Detects when client1 leaves the call
      firstSocket.once('Leave Media Stream', endStream); // Detects when client1 leaves the call
      socket.once('disconnect', endStream); // Ends call when user closes page
      firstSocket.once('disconnect', endStream); // Ends call when user closes page
      socket.on('ice candidate', candidate => firstSocket.emit('ice candidate', candidate)); // Prepares sending of ice canidates between client1 & client2
      firstSocket.on('ice candidate', candidate => socket.emit('ice candidate', candidate)); // Prepares sending of ice canidates between client1 & client2

      function endStream() { // Function run when call is ended
        callPairs[pairIndex] = [-1, -1]; // Unpairs users
        socket.removeListener('Leave Media Stream', endStream); // Removes listener for leave event
        firstSocket.removeListener('Leave Media Stream', endStream); // Removes listener for leave event
        socket.removeListener('disconnect', endStream); // Removes listener for leave event
        firstSocket.removeListener('disconnect', endStream); // Removes listener for leave event
        socket.removeListener('ice candidate', candidate => firstSocket.emit('ice candidate', candidate)); // Stops transmission of ice canidates
        firstSocket.removeListener('ice candidate', candidate => socket.emit('ice candidate', candidate)); // Stops transmission of ice canidates
        socket.emit('Call Ended', e.type); // Tells client1 the call is over
        firstSocket.emit('Call Ended', e.type); // Tells client2 the call is over
      }

      socket.emit('Call Started', {type: e.type, user: 0}); // Tells client1 the call has started
      firstSocket.emit('Call Started', {type: e.type, user: 1}); // Tells client2 the call has started

      socket.once('offer', desc => { // Detects when client1 creates local description
        firstSocket.once('final desc', () => {
          socket.emit('All Descs');
          firstSocket.emit('All Descs');
        });

        firstSocket.emit('offer', {from: 1, desc: desc}); // Sends local description to client2
        firstSocket.once('answer', d => socket.emit('answer', {desc: d, from: 2})); // Waits for client2 to send local description & sends it to client1
      });

      socket.once('My Peer', peer => {
        firstSocket.emit('Other Peer');
      });

      firstSocket.once('My Peer', peer => {
        socket.emit('Other Peer');
      });
    }
  }], ['disconnect', () => { // When client2 goes offline while call is being requested
    onResponse();
    socket.emit('Call Res', 'This user has gone offline since time of request.'); // Tells client1 that client2 just disconnected
  }]];

  const timeout = setTimeout(() => {
    onResponse();
    socket.emit('Call Res', 'Your call was ignored.'); // Tells client1 that client2 ignored their request
  }, 1e4);

  function onResponse() { // Removes all listeners
    firstSocket.removeListener(...(emitters[0]));
    firstSocket.removeListener(...(emitters[1]));
    clearTimeout(timeout);
    callMenu[callMenu.indexOf(e.to)] = -1;
  }

  firstSocket.once(...(emitters[0])); // Adds listener 1
  firstSocket.once(...(emitters[1])); // Adds listener 2
};