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

var dryRun = false;
var tryCount = 0;

if (process.argv.length > 2) {
  dryRun = (process.argv.indexOf('--dry') !== -1);
}

var twit = new Twit(config.twitter);

((function go() {
  var composeScene;

  ComposeScene({}, sb(getImages));

  function getImages(composeSceneFn) {
    composeScene = composeSceneFn;

    var q = queue();
    q.defer(getPokemonImage);
    q.defer(getRandomNYPLCapture, {filterOutBrokenImageLinks: true});
    q.await(sb(assembleImage));

    function assembleImage(pokemonImage, bgImage) {
      var composeOpts = {
        figureURIs: pluck(pokemonImage, 'filepath'),
        bgURI: bgImage.imageURL
      };
      composeScene(composeOpts, sb(postComposedImage));
    }
  }
})());

function postComposedImage(buffer, done) {
  debugger;
  var postImageOpts = {
    twit: twit,
    dryRun: dryRun,
    // base64Image: result.base64Image,
    // altText: result.concept,
    caption: '♪ DOO DOO DOO DOO! ♪'
  };
  if (dryRun) {
    const filename = 'image-output/would-have-posted-' +
      (new Date()).toISOString().replace(/:/g, '-') +
      '.png';
    console.log('Writing out', filename);
    fs.writeFileSync(filename, buffer);
    process.exit();
  }

  postImage(postImageOpts, wrapUp);
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
      callNextTick(tryToPostpokemon-nypl-bot);
    }
  }
  else {
    // Technically, the user wasn't replied to, but good enough.
    // lastTurnRecord.recordTurn(callOutId, new Date(), reportRecording);
  }
}
