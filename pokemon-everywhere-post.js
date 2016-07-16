var config = require('./config');

var Twit = require('twit');
// var async = require('async');
var postImage = require('./post-image');
// var getPairedImageResult = require('./get-paired-image-result');
const ComposeScene = require('./compose-scene');
// var fs = require('fs');
var callNextTick = require('call-next-tick');
var sb = require('standard-bail')();
var queue = require('d3-queue').queue;
var getPokemonImage = require('./get-pokemon-image');
var getRandomNYPLCapture = require('public-domain-nypl-captures').getRandomCapture;
var pluck = require('lodash.pluck');
var fs = require('fs');
var makePokemonCaption = require('./make-pokemon-caption');

var dryRun = false;
var tryCount = 0;

if (process.argv.length > 2) {
  dryRun = (process.argv.indexOf('--dry') !== -1);
}

var twit = new Twit(config.twitter);

function go() {
  var composeScene;

  ComposeScene({}, sb(getImages));

  function getImages(composeSceneFn) {
    composeScene = composeSceneFn;
    var captureOpts = {
      filterOutBrokenImageLinks: true,
      validSizes: [
        // 'q',
        'w',
        'r'
      ]
    };

    var caption;
    var q = queue();
    q.defer(getPokemonImage);
    q.defer(getRandomNYPLCapture, captureOpts);
    q.await(sb(assembleImage));

    function assembleImage(pokemonImages, bgImage) {
      caption = makePokemonCaption(
        pluck(pokemonImages, 'name'), bgImage.title, bgImage.digitalCollectionsURL
      );

      if (!bgImage.preferredImageURL) {
        wrapUp(new Error('Could not get reasonably-sized background.'));
      }
      else {
        var composeOpts = {
          figureURIs: pluck(pokemonImages, 'filepath'),
          bgURI: bgImage.preferredImageURL
        };
        composeScene(composeOpts, sb(postComposedImage));
      }
    }

    function postComposedImage(buffer, done) {
      var postImageOpts = {
        twit: twit,
        dryRun: dryRun,
        base64Image: buffer.toString('base64'),
        altText: caption,
        caption: caption
      };

      if (dryRun) {
        const filename = 'image-output/would-have-posted-' +
          (new Date()).toISOString().replace(/:/g, '-') +
          '.png';
        console.log('Writing out', filename);
        fs.writeFileSync(filename, buffer);
        process.exit();
      }
      else {
        debugger;
        postImage(postImageOpts, wrapUp);
      }
    }
  }
}

function wrapUp(error, data) {
  tryCount += 1;

  if (error) {
    console.log(error, error.stack);

    if (data) {
      console.log('data:', data);
    }

    if (tryCount < 5) {
      console.log(tryCount, 'tries so far. Trying again!');
      callNextTick(go);
    }
    else {
      console.log('Hit max tries. Giving up.');
    }
  }
}

go();
