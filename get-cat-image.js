var gis = require('g-i-s');
var probable = require('probable');
var pickFirstGoodURL = require('pick-first-good-url');
var callNextTick = require('call-next-tick');
var pluck = require('lodash.pluck');
var pathExists = require('object-path-exists');
var sb = require('standard-bail')();
var queue = require('d3-queue').queue;

var catCountTable = probable.createTableFromSizes([
  [9, 1],
  [3, 2],
  [2, 3],
  [1, 3 + probable.roll(10)]
]);

function getCatImage(allDone) {
  var gisOpts = {
    searchTerm: 'cat',
    queryStringAddition: '&safe=active&tbs=ic:trans,itp=photo',
    filterOutDomains: [
      'deviantart.net',
      'deviantart.com',
      'tumblr.com',
      'pinterest.com'
    ]
  };

  gis(gisOpts, sb(checkGISResults, allDone));

  function checkGISResults(results) {
    if (results.length < 1) {
      allDone(new Error('Could not find cat image?!'));
    }
    else {
      // To consider: Use separate behavior config for specific bots.
      var imageResults = probable.shuffle(
        results.slice(0, 1000)
      );
      var allResultURLs = pluck(imageResults, 'url');

      var q = queue(1);
      // TODO: Maybe make a pickNFirstGoodURLs?
      for (var i = 0; i < catCountTable.roll(); ++i) {
        q.defer(
          pickFirstGoodURL,
          {
            urls: allResultURLs.slice(i),
            responseChecker: isImageMIMEType
          }
        );
      }

      q.awaitAll(sb(passAlongGoodCatImages, allDone));
    }
  }

  function passAlongGoodCatImages(goodURLs, allDone) {
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

function isImageMIMEType(response, done) {
  if (pathExists(response, ['headers', 'content-type'])) {
    callNextTick(
      done, null, response.headers['content-type'].indexOf('image/') === 0
    );
  }
  else {
    callNextTick(done, null, false);
  }
}

module.exports = getCatImage;
