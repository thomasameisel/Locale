/**
 * Created by Tommy on 3/30/2016.
 */
var RateLimiter = require('limiter').RateLimiter;
var makeRequest = require('./makeRequest');
var communitiesPctOfAvg = require('./communitiesPctOfAvg');

var limiter = new RateLimiter(80, 'hour');
var limiter2 = new RateLimiter(1, 500);

var key = '6ad3eae3512f6fe2d6aae88a91db5773b1dbef33';

var infoURL = 'http://streeteasy.com/nyc/api/areas/info';
var rentalURL = 'http://streeteasy.com/nyc/api/rentals/data';

function findID(name, callback) {
  var params = {
    id: name,
    key: key,
    format: 'json'
  };
  makeStreetEasyRequest(infoURL, params, function(err, res) {
    if (err) {
      callback(err);
    } else {
      callback(null, res.path);
    }
  });
}

function averagePPSFRental(communityInfo, callback) {
  var params = {
    criteria: 'area:' + communityInfo.streetEasyID,
    key: key,
    format: 'json'
  };
  makeStreetEasyRequest(rentalURL, params, function(err, res) {
    if (err) {
      return callback(err);
    } else {
      return callback(null, res.average_ppsf);
    }
  });
}

function makeStreetEasyRequest(URL, params, callback) {
  limiter.removeTokens(1, function() {
    limiter2.removeTokens(1, function() {
      makeRequest(URL, params, callback);
    });
  });
}

function communitiesPricePctOfAvg(communitiesInfo, callback) {
  communitiesPctOfAvg.communitiesPctOfAvg(communitiesInfo,
                                          averagePPSFRental,
                                          function(err, result) {
    return callback(err, result);
  });
}

module.exports = {
  findID: findID,
  communitiesPricePctOfAvg: communitiesPricePctOfAvg
};