function addCallListeners() {
  SocketIO.on('Call Started', call => {
    if(call.type === 'video') {
      document.getElementById('video-box').style.display = 'block';
    } else {

    }
  });

  SocketIO.on('offer', desc => {
    console.log('Recieved Offer');
    if(!peer) createPeer();
    getMedia(false, desc);
  });

  SocketIO.on('answer', desc => {
    if(!peer) createPeer();
    peer.setRemoteDescription(desc.desc);
    SocketIO.emit('final desc');
    console.log('Set Remote Descrption');
  });

  SocketIO.on('ice candidate', candidate => {
    if(!peer) createPeer();
    console.log('Recieved Canidate');
    peer.addIceCandidate(JSON.parse(candidate));
  }); 

  SocketIO.on('All Descs', onDescComp);
}

function requestCall(friend) {
  SocketIO.emit('Call Request', {type: 'video', token: localStorage.getItem('token'), to: friend.id});
  SocketIO.once('Call Res', res => {
    alert(res);
    if(res.indexOf('accept') === -1) return;
    createPeer();
    getMedia(true);
  });
}

function getMedia(caller, desc) {
  let onSuccess = stream => {
    streamVar = stream;
    document.getElementById('video-self').srcObject = stream;
    document.getElementById('video-self').play();
    console.log('ADDING STREAM TO PEER');
    peer.addStream(stream);
    console.log('This did the whole "running" thing');

    if(caller) {
      peer.createOffer().catch(console.error).then(offer => {
        console.log('Set Local Description (Offer)');
        return peer.setLocalDescription(new RTCSessionDescription(offer));
      }).catch(console.error).then(() => {
        SocketIO.emit('offer', peer.localDescription);
        console.log('Emitted Offer');
      }).catch(console.error);
    } else {
      peer.setRemoteDescription(desc.desc).then(() => {
        console.log('Set Remote Description');
        return peer.createAnswer();
      }).then(answer => {
        console.log('Created Answer');
        return peer.setLocalDescription(answer);
      }).then(() => {
        console.log('Set Local Description (Answer)');
        SocketIO.emit('answer', peer.localDescription);
        console.log('Emitted Answer');
      });
    }
  };

  let onFail = () => alert('Cannot get webcam data');
  let config = {
    video: {
      width: document.getElementById('video-remote').offsetWidth,
      height: document.getElementById('video-remote').offsetHeight
    },
    audio: true
  };

  if('getUserMedia' in (navigator.mediaDevices || new Object())) navigator.mediaDevices.getUserMedia(config).then(onSuccess).catch(onFail);
  else (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia)(config, onSuccess, onFail);
}

let called = 0;
let tracked = 0;

function createPeer() {
  called++;
  console.log(called);

  peer = new RTCPeerConnection({iceServers: [{urls: 'stun:stun.l.google.com:19302'}]});
  peer.onicecandidate = e => {
    if(!e.candidate) return;
    console.log('Sending Candidate');
    SocketIO.emit('ice candidate', JSON.stringify(e.candidate));
  };
  peer.ontrack = e => {
    tracked++;
    console.log(tracked);
    let id = 'video-remote';
    console.log('Hellovgrfderfij rfij rf4tij fcui9 ofr');
    console.log('Adding stream to video');
    document.getElementById(id).srcObject = e.streams[0];
    document.getElementById(id).play();
  };
}

function onDescComp() {
  SocketIO.emit('My Peer', JSON.stringify(peer));
  SocketIO.emit('Other Peer', p => global.other = JSON.parse(p));
}