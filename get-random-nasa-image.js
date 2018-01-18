var request = require('request');
var sb = require('standard-bail')();
var probable = require('probable');
var queue = require('d3-queue').queue;

const baseURL = 'https://images-api.nasa.gov/search';

function GetRandomNASAImage({ pickSearchString }) {
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

      var thumbnailURL = item.links[0].href;
      // Warning: This is brittle. Proper way would be to get the JSON
      // file at `data.href` then get the image link from there.
      // ~orig is often too much memory, but worth trying if medium doesn't exist.
      var q = queue();
      q.defer(checkMIMEType, thumbnailURL.replace('~thumb', '~medium'));
      q.defer(checkMIMEType, thumbnailURL.replace('~thumb', '~orig'));
      q.await(sb(passResult, done));

      function passResult(mediumURL, origURL) {
        var result = {
          id: item.data[0].nasa_id,
          title: item.data[0].title,
          image: mediumURL ? mediumURL : origURL
        };
        done(null, result);
      }
    }
  }
}

// Passes back the url if it is good, otherwise passes nothing.
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
      done(null, url);
    } else {
      console.log('No content-type found on ' + url);
      done();
    }
  }
}

module.exports = GetRandomNASAImage;
