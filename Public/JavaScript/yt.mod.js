let YTPlayer, YTContainer, YTMain, YTOverlay;
let YTReady = false;

let pendingPlayers = new Array();

function managePlayers() {
  pendingPlayers.forEach(player => {
    let parts = player.split(':');
    let playerID = parts[0];
    let vidID = parts[1];

    let localplayer = new YT.Player(`yt${playerID}`, {
      width: 280,
      height: 157.5,
      videoId: vidID,
      playerVars: {
        modestbranding: 0,
        rel: 0
      }
    });

    let container = document.getElementById(`yt-container${playerID}`);

    container.onclick = () => {
      localplayer.stopVideo();
      buildYTBox(vidID);
    };
    
    container.onmouseover = () => container.style.backgroundColor = 'lightgrey';
    container.onmouseout = () => container.style.backgroundColor = 'white';
  });

  pendingPlayers = new Array();
}

function onYouTubeIframeAPIReady() {
  YTReady = true;
}

function buildYTBox(id) {
  YTMain.style.display = 'block';
  YTContainer.innerHTML = '<div id="yt-player"></div>';
  YTPlayer = new YT.Player('yt-player', {
    width: 280,
    height: 157.5,
    videoId: id,
    events: {
      onReady: YTLoad,
      onStateChange: YTChange
    },
    playerVars: {
      //controls: 0,
      modestbranding: 0,
      rel: 0
    }
  });
}

function YTLoad(e) {
  e.target.playVideo();
}

let finished = false;
function YTChange(e) {
  if(e.data !== YT.PlayerState.ENDED) return;
  YTPlayer.stopVideo();
  document.getElementById('yt-main').style.display = 'none';
  finished = true;
  YTPlayer = null;
  document.getElementById('yt-player').innerHTML = new String();
}

function ytReady() {
  YTOverlay = document.getElementById('yt-overlay');
  YTContainer = document.getElementById('yt-container');
  YTMain = document.getElementById('yt-main');

  YTMain.onmouseover = () => YTOverlay.style.display = 'block';
  YTMain.onmouseout = () => YTOverlay.style.display = 'none';
  YTOverlay.onmouseover = () => YTOverlay.style.backgroundColor = '#dddddd';
  YTOverlay.onmouseout = () => YTOverlay.style.backgroundColor = 'white';
  YTOverlay.onclick = () => {
    YTMain.style.display = 'none';
    YTPlayer.stopVideo();
    finished = true;
    YTPlayer = null;
    document.getElementById('yt-player').innerHTML = new String();
  };
}