'use strict';

module.exports = str => {
  const rightChars = require('./../Actions/static').get('rightChars').split(/(?!$)/u);
  const noRight = str.replace(new RegExp(rightChars.join('|'), 'g'), new String());
  const isRight = noRight.length < 0.5 * str.length;

  function RemoveFirstBR() {
    if(!str.startsWith('\n')) return;
    str = str.replace('\n', new String());
    RemoveFirstBR();
  }

  function RemoveLastBR() {
    if(!str.endsWith('\n')) return;
    str = str.split(/(?!$)/u).reverse().join(new String()).replace('\n', new String()).split(/(?!$)/u).reverse().join(new String());
    RemoveLastBR();
  }

  RemoveFirstBR();
  RemoveLastBR();

  str = LINKIFY(str, {attributes: {
    class: 'sent-link',
    target: '_blank'
  }});

  str = str.split('\n').join('<br />');

  let isItalic = false;
  let isBold = false;
  let isSup = false;
  let isSub = false;
  let isLined = false;
  let isStrike = false;
  let isLink = false;
  let isSpoil = false;

  let chars = str.split(/(?!$)/u);
  let max = str.length - 1;
  let index = 0;
  let newStr = new String();

  while(index <= max) {
    switch(chars[index]) {
    case '<':
      if(chars[index + 1] === 'a') {
        isLink = true;
      }else if(chars[index + 1] === '/' && chars[index + 2] === 'a') {
        isLink = false;
      }

      newStr += '<';
      break;
    case (isLink ? chars[index] : '--'): 
      newStr += chars[index];
      break;
    case '*':
      if(chars[++index] === '*') {
        isBold = !isBold;
        newStr += isBold ? '<b>' : '</b>';
      } else {
        isItalic = !isItalic;
        newStr += isItalic ? '<i>' : '</i>';
        index--;
      }

      break;
    case '^':
      if(chars[++index] === '^') {
        isSup = !isSup;
        newStr += isSup ? '<sup>' : '</sup>';
      } else {
        newStr += '^';
        index--;
      }

      break;
    case '_':
      if(chars[++index] === '_') {
        isSub = !isSub;
        newStr += isSub ? '<sub>' : '</sub>';
      } else {
        isLined = !isLined;
        newStr += isLined ? '<u>' : '</u>';
        index--;
      }

      break;
    case '~':
      isStrike = !isStrike;
      newStr += isStrike ? '<span style="text-decoration: line-through;">' : '</span>';
      break;
    case '|':
      isSpoil = !isSpoil;
      newStr += isSpoil ? '<spoil class="spoil">' : '</spoil>';
      break;
    case '\\':
      newStr += chars[++index];
      break;
    default: newStr += chars[index];
    }

    index++;
  }

  if(isBold) newStr = newStr.split(/(?!$)/u).reverse().join(new String()).replace('>b<', '**').split(/(?!$)/u).reverse().join(new String());
  if(isItalic) newStr = newStr.split(/(?!$)/u).reverse().join(new String()).replace('>i<', '*').split(/(?!$)/u).reverse().join(new String());
  if(isSup) newStr = newStr.split(/(?!$)/u).reverse().join(new String()).replace('>pus<', '^^').split(/(?!$)/u).reverse().join(new String());
  if(isSub) newStr = newStr.split(/(?!$)/u).reverse().join(new String()).replace('>bus<', '__').split(/(?!$)/u).reverse().join(new String());
  if(isLined) newStr = newStr.split(/(?!$)/u).reverse().join(new String()).replace('>u<', '_').split(/(?!$)/u).reverse().join(new String());
  if(isStrike) newStr = newStr.split(/(?!$)/u).reverse().join(new String()).replace('>";hguorht-enil :noitaroced-txet"=elyts naps<', '~').split(/(?!$)/u).reverse().join(new String());
  if(isSpoil) newStr = newStr.split(/(?!$)/u).reverse().join(new String()).replace('>"liops"=di tnof<', '|').split(/(?!$)/u).reverse().join(new String());

  newStr = newStr.replace(/cabine/gi, '<span class="cabine">CABINE</span>');
  if(isRight) {
    newStr = `<font class="rightToLeft">${newStr}</font>`;
  }

  if(newStr.replace(/<b>|<\/b>|<i>|<\/i>|<sub>|<\/sub>|<sup>|<\/sup>|<u>|<\/u>|<span style="text-decoration: line-through;">|<\/span>|<spoil class="spoil">|<\/spoil>| |<br \/>|\t/g, new String()).length < 1) return str;

  return newStr;
}