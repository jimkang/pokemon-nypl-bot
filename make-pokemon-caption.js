var probable = require('probable');
var truncateToTweet = require('tweet-truncate');
var toTitleCase = require('titlecase');

var connectors = [' ; ', ' | ', ' + ', ' on ', ' – ', ' @ '];

var punctuation = ['!', '.', ''];

function makePokemonCaption({ pokemonNames, exhibit, url, hyperlinkExhibit }) {
  var caption = '';
  if (pokemonNames.length > 0 && exhibit) {
    caption += pokemonNames.map(toTitleCase).join(', ');
    caption += probable.pickFromArray(connectors);
    if (hyperlinkExhibit) {
      caption += `<a href="${url}">${exhibit}</a>`;
    } else {
      caption += exhibit;
    }
    caption += probable.pickFromArray(punctuation);
  }
  if (url && !hyperlinkExhibit) {
    caption = truncateToTweet({
      text: caption,
      urlsToAdd: [url]
    });
  }
  return caption;
}

module.exports = makePokemonCaption;
