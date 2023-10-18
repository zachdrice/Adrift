module.exports = function(dir) {
  this.EXPRESS = require('express');
  this.HTTP = require('http');
  this.APP = this.EXPRESS();
  this.SERVER = this.HTTP.createServer(this.APP);
  this.BODYPARSER = require('body-parser');
  this.SOCKET = new Object();

  Object.defineProperty(this.SOCKET, 'IO', {
    value: require('socket.io').listen(this.SERVER, {origins: '*:*'}),
    writable: false
  });

  this.PORT = process.env.PORT || 80;
  this.PATH = require('path');
  this.DIRNAME = dir;
  this.FS = require('fs');
  this.LINKIFY = require('linkify-urls');

  const getDB = file => JSON.parse(this.FS.readFileSync(this.PATH.join(this.DIRNAME, 'DB', `${file}.json`), 'utf8'));

  this.DB = Object.assign(getDB('chats'), getDB('static'), getDB('users'));
  this.SIOFU = require('socketio-file-upload');
  this.USERAGENT = require('express-useragent');
  this.DDOS_MOD = require('ddos');
  this.DDOS = new DDOS_MOD({burst: 10, limit: 300});

  this.chatMembers = new Object();
  this.chatMemberSockets = new Object();
  this.chatSockets = new Object();
  
  this.callPairs = new Array();
  this.callCooldown = new Array();
  this.callMenu = new Array();
};