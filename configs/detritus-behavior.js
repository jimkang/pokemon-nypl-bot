var GetRandomNASAImage = require('../get-random-nasa-image');
var probable = require('probable');

module.exports = {
  getBackgroundImage: GetRandomNASAImage({
    pickSearchString: probable.createTableFromSizes([
      [6, 'galaxy'],
      [10, 'nebula'],
      [2, 'star'],
      [10, 'planet'],
      [2, 'space'],
      [10, 'moon'],
      [2, 'asteroid'],
      [10, 'mars']
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
      [10, 'snail'],
      [8, 'snake photo'],
      [5, 'drake rapper transparent background'],
      [8, 'skull'],
      [10, 'skeleton'],
      [10, 'taco'],
      [2, 'burrito'],
      [3, 'cat transparent background'],
      [1, 'lego'],
      [7, 'fruit'],
      [7, 'eggplant'],
      [3, 'vegetable']
    ]).roll
  }),
  rotationChance: 1
};
