const async = require('async');
const Jimp = require('jimp');
const PasteBitmaps = require('paste-bitmaps');
const probable = require('probable');
const roll = probable.roll;
const rollDie = probable.rollDie;
const callNextTick = require('call-next-tick');
const queue = require('d3-queue').queue;
const sb = require('standard-bail')();
const request = require('request');

const maxSceneWidth = 1600;
const maxSceneHeight = 900;
const marginX = ~~(maxSceneWidth/4);
const marginY = ~~(maxSceneHeight/4);

function ComposeScene(createOpts, createDone) {
  var pasteBitmaps;
  var pasteConfig = {
  };
  PasteBitmaps(pasteConfig, passComposeFn);

  function passComposeFn(error, thePasteBitmapsFn) {
    if (error) {
      createDone(error);
    }
    else {
      pasteBitmaps = thePasteBitmapsFn;
      createDone(null, ComposeScene);
    }
  }

  function ComposeScene(opts, sceneDone) {
    var figureURIs;
    var bgURI;
    var scene;

    if (opts) {
      figureURIs = opts.figureURIs;
      bgURI = opts.bgURI;
    }

    async.waterfall(
      [
        getBG,
        loadBGBuffer,
        resizeBG,
        loadFigures,
        pasteTogetherImage
      ],
      sceneDone
    );

    function getBG(done) {
      var reqOpts = {
        url: bgURI,
        encoding: null,
      };
      request(reqOpts, done);
    }

    function loadBGBuffer(response, buffer, done) {
      Jimp.read(buffer, done);      
    }

    function resizeBG(bg, done) {
      bg.contain(maxSceneWidth, maxSceneHeight);
      callNextTick(done, null, bg);
    }

    function loadFigures(bg, done) {
      var q = queue(1);
      figureURIs.forEach(queueFigureLoad);
      q.awaitAll(sb(passImages, done));

      function queueFigureLoad(figureURI) {
        q.defer(Jimp.read, figureURI);
      }

      function passImages(figures) {
        done(null, bg, figures);
      }
    }

    function pasteTogetherImage(bg, figures, done) {      
      var imageSpecs = figures.map(placeInstance);
      imageSpecs.unshift({
        jimpImage: bg,
        x: 0,
        y: 0
      });

      var pasteOpts = {
        background: {
          width: bg.bitmap.width,
          height: bg.bitmap.height,
          fill: roll(3) === 0 ? 0xFFFFFFFF : Jimp.rgbaToInt(roll(256), roll(256), roll(256), 0xFF)
        },
        images: imageSpecs
      };

      pasteBitmaps(pasteOpts, done);

      function placeInstance(thing) {
        return {
          jimpImage: thing,
          x: marginX + roll(bg.bitmap.width - 2 * marginX) - thing.bitmap.width/2,
          y: marginY + roll(bg.bitmap.height - 2 * marginY) - thing.bitmap.height/2
        };
      } 
    }
  }
}

module.exports = ComposeScene;
