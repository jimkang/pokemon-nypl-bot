/* global process */

var Twit = require('twit');
var postImage = require('./post-image');
var ComposeScene = require('./compose-scene');
var callNextTick = require('call-next-tick');
var sb = require('standard-bail')();
var queue = require('d3-queue').queue;
var pluck = require('lodash.pluck');
var fs = require('fs');
var makePokemonCaption = require('./make-pokemon-caption');

var configPath;
var behaviorPath;

if (process.env.CONFIG) {
  configPath = './configs/' + process.env.CONFIG + '-config';
  behaviorPath = './configs/' + process.env.CONFIG + '-behavior';
}
else {
  configPath = './configs/nypl-config';
  behaviorPath = './configs/behavior-config';
}

var config = require(configPath);
var behavior = require(behaviorPath);
var dryRun = false;
var tryCount = 0;

if (process.argv.length > 2) {
  dryRun = (process.argv.indexOf('--dry') !== -1);
}

var getForegroundImage = behavior.getForegroundImage;

var twit = new Twit(config.twitter);

function go() {
  var composeScene;
  var composeOpts  = {
    rotationChance: behavior.rotationChance
  };

  ComposeScene(composeOpts, sb(getImages));

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
    var filePath;
    var q = queue();
    q.defer(getForegroundImage);
    q.defer(behavior.getBackgroundImage, captureOpts);
    q.await(sb(assembleImage));

    function assembleImage(pokemonImages, bgImage) {
      caption = makePokemonCaption(
        pluck(pokemonImages, 'name'),
        bgImage[behavior.properties.title],
        bgImage[behavior.properties.url]
      );

      filePath = 'image-output/would-have-posted-' +
          (new Date()).toISOString().replace(/:/g, '-') +
          pluck(pokemonImages, 'searchString') +
          bgImage[behavior.properties.title] + '.png';

      if (!bgImage[behavior.properties.image]) {
        wrapUp(new Error('Could not get reasonably-sized background.'));
      }
      else {
        var composeOpts = {
          figureURIs: pluck(pokemonImages, 'path'),
          bgURI: bgImage[behavior.properties.image]
        };
        composeScene(composeOpts, sb(postComposedImage));
      }
    }

    function postComposedImage(buffer) {
      var postImageOpts = {
        twit: twit,
        dryRun: dryRun,
        base64Image: buffer.toString('base64'),
        altText: caption,
        caption: caption
      };

      if (dryRun) {
        console.log('Writing out', filePath);
        fs.writeFileSync(filePath, buffer);
        process.exit();
      }
      else {
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
