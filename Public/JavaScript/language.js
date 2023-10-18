window.addEventListener('load', () => {

let languages = {pages: {
  login: {
    en: {
      adrift: 'Adrift',
      username: 'Username',
      password: 'Password',
      'signup-a': 'Create an Account',
      'login-btn': 'Login',
      title: 'Login | Adrift'
    }
  },
  signup: {
    en: {
      adrift: 'Adrift',
      'name-first': 'First Name',
      'name-last': 'Last Name',
      username: 'Username',
      password: 'Password',
      confirm: 'Confirm Password',
      'login-a': 'Login',
      'signup-btn': 'Sign Up',
      title: 'Signup | Adrift'
    }
  },
  invite: {
    en: {
      'created-label': 'Created',
      join: 'Join',
      'owner-label': 'Owner',
      'member-label': 'Members',
      'return': 'Return to Adrift',
      title: 'Invite | Adrift'
    }
  },
  chat: {
    en: {
      'call-type-voice': 'Voice',
      'call-type-video': 'Video',
      'call-label': 'Call',
      'create-chat-label': 'Create Chat',
      'create-name': 'Name of Chat',
      'create-password': 'Chat Password',
      'public-checkbox-label': 'Public',
      'create-button': 'Create Chat',
      'join-chat-label': 'Join Chat',
      'join-name': 'Name of Chat',
      'join-password': 'Chat Password',
      'join-button': 'Join Chat',
      'notify-header': 'Notifications',
      'user-isfriend': 'Friend',
      'user-add': 'Add Friend',
      'user-remove': 'Remove Friend',
      'dark-mode-toggle-label': 'Dark Mode',
      mTitleTxt: 'Adrift',
      chatsBtn: 'Chats',
      'usersBtn': 'Users',
      'clear-msgs-btn': 'Clear Messages',
      'logout': 'Logout',
      'friends-button': 'Friends',
      'small-txt-chats': 'Chats',
      'small-txt-actions': 'Actions',
      message: 'Message Chat',
      edit: 'Edit',
      cancel: 'Cancel',
      'online-users-label': 'Online Users',
      'chat-new-button': 'New',
      'chat-join-button': 'Join',
      'chat-delete-button': 'Delete',
      'chat-invite-button': 'Invite'
    }
  }
}, update: {chat: [
  'chat-new-button', 'chat-join-button',
  'chat-delete-button', 'chat-invite-button'
]}};

if(!(pageTitle in languages.pages)) return;

let browserLang = window.navigator.userLanguage || window.navigator.language;
let langs = languages.pages[pageTitle];

let lang;
if(window.location.hash.replace('#', String()) in languages.pages[pageTitle]) {
  lang = window.location.hash.replace('#', new String());
}

if(typeof lang === 'undefined') for(let langObj in langs) {
  if(!browserLang.toLowerCase().startsWith(langObj)) continue;
  lang = langObj;
  break;
}

if(typeof lang === 'undefined') lang = 'en';

for(let id in langs[lang]) {
  if(id === 'title') {
    document.title = langs[lang][id];
    continue;
  }

  try {
    let el = document.getElementById(id);
    if(el.tagName !== 'INPUT' && el.tagName !== 'TEXTAREA') {
      el.innerHTML = langs[lang][id];
    } else {
      el.placeholder = langs[lang][id];
    }
  } catch(err) {}
}

updateTextLang = () => {
  if(lang === 'en') return;
  for(let id of languages.update[pageTitle]) {
    try{
      document.getElementById(id).innerHTML = languages.pages[pageTitle][lang][id];
    }catch(err){}
  }
}


});