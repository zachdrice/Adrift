let idleTimeout = setTimeout(isIdle, 6e5);

window.onload = resetIdle;
window.onscroll = resetIdle;
window.onblur = resetIdle;
window.onfocus = resetIdle;

document.onscroll = resetIdle;
document.onclick = resetIdle;
document.onkeydown = resetIdle;
document.onkeyup = resetIdle;
document.onmousemove = resetIdle;

function resetIdle() {
  clearTimeout(idleTimeout);
  idleTimeout = setTimeout(isIdle, 6e5);
}

function isIdle() {
  localStorage.removeItem('token');
  window.location = 'idle.html';
}