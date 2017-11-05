var randomApod = require('random-apod');
var callNextTick = require('call-next-tick');

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
  getForegroundImage: require('../get-cat-image'),
  rotationChance: 1
};
