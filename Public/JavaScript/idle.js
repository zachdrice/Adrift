localStorage.removeItem('token');
document.getElementsByTagName('h3')[0].onclick = () => {
  window.location = 'login';
};

document.getElementsByTagName('span')[0].style.cursor = 'pointer';