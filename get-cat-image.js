var gis = require('g-i-s');
var probable = require('probable');
// var pickFirstGoodURL = require('pick-first-good-url');
// var callNextTick = require('call-next-tick');
var pluck = require('lodash.pluck');
// var pathExists = require('object-path-exists');
var sb = require('standard-bail')();

var catCountTable = probable.createTableFromSizes([
  [80, 1],
  [15, 2],
  [5, 3],
  [1, 3 + probable.roll(10)]
]);

function getCatImage(allDone) {
  var desiredNumberOfCats = catCountTable.roll();
  var gisOpts = {
    searchTerm: 'pizza transparent background',
    queryStringAddition: '&safe=active&tbs=ic:trans,itp=photo',
    filterOutDomains: [
      'deviantart.net',
      'deviantart.com',
      'tumblr.com',
      'pinterest.com',
      'freestockphotos.biz',
      'experts-exchange.com',
      'stickpng.com',
      'pngmart.com',
      'freepngimages.com',
      'reddit.com'
    ]
  };

  gis(gisOpts, sb(checkGISResults, allDone));

  function checkGISResults(results) {
    var allResultURLs = [];

    if (results.length < 1) {
      allDone(new Error('Could not find cat image?!'));
    }
    else {
      let imageResults = probable.shuffle(
        results.slice(0, 100)
      );
      allResultURLs = pluck(imageResults, 'url');
      passAlongGoodCatImages(allResultURLs.slice(0, desiredNumberOfCats));
    }
  }

  function passAlongGoodCatImages(goodURLs) {
    if (!goodURLs || goodURLs.length < 1) {
      allDone(new Error('Could not find cat image?!'));
    }
    else {
      allDone(null, goodURLs.map(wrapURLInMetadata));
    }
  }
}

function wrapURLInMetadata(url) {
  return {
    path: url,
    name: 'cat'
  };
}

// function isImageMIMEType(response, done) {
//   if (pathExists(response, ['headers', 'content-type'])) {
//     callNextTick(
//       done, null, response.headers['content-type'].indexOf('image/') === 0
//     );
//   }
//   else {
//     callNextTick(done, null, false);
//   }
// }

module.exports = getCatImage;
