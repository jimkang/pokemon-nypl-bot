var request = require('request');
var sb = require('standard-bail')();
var probable = require('probable');

const baseURL = 'https://images-api.nasa.gov/search';

function GetRandomNASAImage({pickSearchString}) {
  return getRandomNASAImage;

  // TODO: Maybe respect these opts someday?
  function getRandomNASAImage(opts, done) {
    var searchString = pickSearchString();
    request(
      {
        url: baseURL,
        qs: {
          media_type: 'image',
          q: searchString
        },
        json: true,
        method: 'GET'
      },
      sb(reduceBodyToImageObject, done)
    );

    function reduceBodyToImageObject(res, body) {
      if (res.statusCode < 200 || res.statusCode > 299) {
        done(new Error('Request failed. Status code: ' + res.statusCode));
        return;
      }

      var item = probable.pickFromArray(body.collection.items);
      // Warning: This is brittle. Proper way would be to get the JSON
      // file at `data.href` then get the image link from there.
      var thumbnailURL = item.links[0].href;
      var result = {
        id: item.data[0].nasa_id,
        title: item.data[0].title,
        image: thumbnailURL.replace('~thumb', '~medium') // ~orig is often too much memory.
      };
      checkMIMEType(result.image, sb(passResult, done));

      function passResult() {
        done(null, result);
      }
    }
  }
}

function checkMIMEType(url, done) {
  request(
    {
      url: url,
      method: 'HEAD'
    },
    sb(inspectHeaders, done)
  );

  function inspectHeaders(res) {
    console.log('content-type:', res.headers['content-type']);
    if (res.headers['content-type']) {
      done();
    }
    else {
      done(new Error('No content-type found on ' + url));
    }
  }
}

module.exports = GetRandomNASAImage;
