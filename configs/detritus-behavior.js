var GetRandomNASAImage = require('../get-random-nasa-image');
var probable = require('probable');

module.exports = {
  getBackgroundImage: GetRandomNASAImage({
    pickSearchString: probable.createTableFromSizes([
      [6, 'galaxy'],
      [10, 'nebula'],
      [5, 'star'],
      [2, 'planet'],
      [2, 'black hole'],
      [3, 'moon'],
      [2, 'surface'],
      [1, 'asteroid'],
      [4, 'rings'],
      [6, 'bright'],
      [5, 'colorful'],
      [2, 'mars'],
      [3, 'pluto'],
      [2, 'neptune'],
      [3, 'saturn'],
      [3, 'jupiter'],
      [1, 'venus'],
      [2, 'mercury'],
      [3, 'comet']
    ]).roll
  }),
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
      [8, 'snail'],
      [8, 'snake photo'],
      [5, 'drake rapper transparent background'],
      [8, 'skull'],
      [10, 'skeleton'],
      [10, 'taco'],
      [2, 'burrito'],
      [3, 'cat transparent background'],
      [1, 'lego'],
      [2, 'fruit'],
      [7, 'eggplant'],
      [3, 'vegetable']
    ]).roll
  }),
  rotationChance: 1
};
