var randomApod = require('random-apod');
var callNextTick = require('call-next-tick');

function randomApodAsync(opts, done) {
  callNextTick(done, null, randomApod());
}

module.exports = {
  getBackgroundImage: randomApodAsync,
  properties: {
    image: 'image',
    title: 'title',
    url: 'id'
  },
  rotationChance: 10
};
