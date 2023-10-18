'use strict';

const encrypt = {
  md5: require('md5'),
  sha1: require('sha1'),
  metaphone: require('metaphone'),
  reverse: str => str.split(/(?!$)/u).reverse().join(new String()),
  count: str => `${Math.floor(str.length / 255)}r${str.length % 255}`
};

const chars = require('../Actions/static').get('charKeys');

encrypt.password = str => {
  str = String(str);
  const first3 = str.slice(0, 3);
  const last4 = str.slice(str.length - 5, str.length);
  const midChar = str.slice(Math.floor(str.length / 2), Math.floor(str.length / 2));
  const newMidChar = midChar in chars ? chars[midChar] : '0';
  const final = newMidChar + encrypt.md5(first3) + encrypt.sha1(encrypt.reverse(encrypt.metaphone(last4))) + encrypt.md5(encrypt.sha1(encrypt.reverse(encrypt.count(str))))
  return final;
};

module.exports = encrypt;