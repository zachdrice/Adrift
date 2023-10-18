'use strict';

module.exports = (len, chars) => {
  const options = chars || require('./../Actions/static').get('randOpts');
  const toArr = options.split(new String());
  let output = new String();
  let index = () => Math.floor(toArr.length * Math.random());
  for(let i = 0; i < len; i++) output += toArr[index()];
  return output;
};