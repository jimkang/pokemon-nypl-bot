var randomApod = require('random-apod');
var callNextTick = require('call-next-tick');
var probable = require('probable');

function randomApodAsync(opts, done) {
  callNextTick(done, null, randomApod());
}

module.exports = {
  getBackgroundImage: randomApodAsync,
  // These are properties in the background image.
  properties: {
    image: 'image',
    title: 'title',
    url: 'id'
  },
  getForegroundImage: require('../get-detritus-image')({
    getSearchString: probable.createTableFromSizes([
      [10, 'pizza transparent background'],
      [10, 'hot dog transparent background'],
      [10, 'burger transparent background'],
      [10, 'snail'],
      [10, 'snake'],
      [10, 'drake rapper transparent background'],
      [10, 'skull'],
      [10, 'skeleton'],
      [10, 'taco'],
      [10, 'burrito'],
      [10, 'cat transparent background']
    ]).roll
  }),
  rotationChance: 1
};
