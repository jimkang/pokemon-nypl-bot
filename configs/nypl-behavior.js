var getRandomNYPLCapture = require('public-domain-nypl-captures')
  .getRandomCapture;

module.exports = {
  getBackgroundImage: getRandomNYPLCapture,
  properties: {
    image: 'preferredImageURL',
    title: 'title',
    url: 'digitalCollectionsURL'
  },
  getForegroundImage: require('../get-pokemon-image')
};
