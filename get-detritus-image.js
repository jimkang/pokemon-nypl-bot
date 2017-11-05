var gis = require('g-i-s');
var probable = require('probable');
// var pickFirstGoodURL = require('pick-first-good-url');
// var callNextTick = require('call-next-tick');
var pluck = require('lodash.pluck');
// var pathExists = require('object-path-exists');
var sb = require('standard-bail')();

var objectCountTable = probable.createTableFromSizes([
  [80, 1],
  [15, 2],
  [5, 3],
  [1, 3 + probable.roll(10)]
]);

function GetDetritusImage({getSearchString}) {
  return getDetritusImage;

  function getDetritusImage(allDone) {
    var searchString = getSearchString();
    var desiredNumberOfObjects = objectCountTable.roll();
    var gisOpts = {
      searchTerm: searchString,
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
        allDone(new Error(`Could not find ${searchString} image?!`));
      }
      else {
        let imageResults = probable.shuffle(
          results.slice(0, 100)
        );
        allResultURLs = pluck(imageResults, 'url');
        passAlongGoodDetritusImages(allResultURLs.slice(0, desiredNumberOfObjects));
      }
    }

    function passAlongGoodDetritusImages(goodURLs) {
      if (!goodURLs || goodURLs.length < 1) {
        allDone(new Error(`Could not find ${searchString} image?!`));
      }
      else {
        allDone(null, goodURLs.map(wrapURLInMetadata));
      }
    }

    function wrapURLInMetadata(url) {
      return {
        path: url,
        name: searchString.replace(' transparent background', '')
      };
    }
  }
}

module.exports = GetDetritusImage;
