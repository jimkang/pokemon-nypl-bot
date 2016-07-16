var probable = require('probable');

var connectors = [
  ' ; ',
  ' | ',
  ' + ',
  ' on ',
  ' – ',
  ' @ '
];

var punctuation = [
  '!',
  '.',
  ''
];

function makePokemonCaption(pokemonNames, exhibit, url) {
  var caption = '';
  if (pokemonNames.length > 0 && exhibit) {
    caption += pokemonNames.join(', ');
    caption += probable.pickFromArray(connectors);
    caption += exhibit;
    caption += probable.pickFromArray(punctuation);
  }
  if (url) {
    caption += ' ' + url;
  };
  return caption;
}

module.exports = makePokemonCaption;
