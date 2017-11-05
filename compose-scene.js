const async = require('async');
const Jimp = require('jimp');
const PasteBitmaps = require('paste-bitmaps');
const probable = require('probable');
const roll = probable.roll;
const callNextTick = require('call-next-tick');
const queue = require('d3-queue').queue;
const sb = require('standard-bail')();
const request = require('request');

const marginX = 0;
const marginY = 0;

function ComposeScene(createOpts, createDone) {
  var rotationChance;

  if (createOpts) {
    rotationChance = createOpts.rotationChance;
  }

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

    if (opts) {
      figureURIs = opts.figureURIs;
      bgURI = opts.bgURI;
    }

    async.waterfall(
      [
        getBG,
        loadBGBuffer,
        // resizeBG,
        loadFigures,
        modifyFigures,
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

    function modifyFigures(bg, figures, done) {
      figures.forEach(scaleIfNecessary);
      figures.forEach(modifyFigure);
      callNextTick(done, null, bg, figures);

      function scaleIfNecessary(figure) {
        if (figure.bitmap.width > bg.bitmap.width/2 ||
          figure.bitmap.height > bg.bitmap.height/2) {

          figure.scaleToFit(
            bg.bitmap.width/2, bg.bitmap.height/2, Jimp.RESIZE_BICUBIC
          );
        }
      }
    }

    function modifyFigure(figure) {
      if (probable.roll(3) === 0) {
        figure.flip(true, false);
      }
      if (rotationChance && probable.roll(100) < rotationChance) {
        figure.rotate(probable.roll(360));
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
          x: marginX + roll(bg.bitmap.width - 2 * marginX - thing.bitmap.width) ,
          y: marginY + roll(bg.bitmap.height - 2 * marginY - thing.bitmap.height)
        };
      } 
    }
  }
}

module.exports = ComposeScene;
