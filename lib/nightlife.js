/**
 * Created by Tommy on 1/26/2016.
 */
var async = require('async');
var GooglePlaces = require('node-googleplaces');
var RateLimiter = require('limiter').RateLimiter;
var communitiesPctOfAvg = require('./communitiesPctOfAvg');

var limiter = new RateLimiter(1, 2000);
var places = new GooglePlaces('AIzaSyDIjIeMxQlnpg9SJofqghnGhMJvrDsDQlo');

function googlePlacesSearch(latLng, radius, pageToken, callback) {
  limiter.removeTokens(1, function(err, remainingCalls) {
    var parameters = {
      location: latLng,
      radius: radius,
      // NOTE: types is deprecated, but is supported until 02/16/17
      // https://developers.google.com/places/web-service/search
      types: 'bar|casino|night_club',
      pagetoken: pageToken
    };
    places.nearbySearch(parameters, function(err, response) {
      return callback(err, response);
    });
  });
}

function getVenuesPerLandArea(communityInfo, callback) {
  var pageToken;
  var numVenues = 0;
  var landArea = Math.PI * communityInfo.radius * communityInfo.radius;
  async.doWhilst(
    function(cb) {
      googlePlacesSearch(communityInfo.latLng, communityInfo.radius, pageToken,
        function(err, result) {
          if (err) {
            console.error(err);
          } else {
            pageToken = result.body.next_page_token;
            numVenues += result.body.results.length;
          }
          return cb();
        });
    },
    function() { return typeof pageToken !== 'undefined'; },
    function(err) { return callback(err, (numVenues / landArea)); }
  );
}

function communitiesNightlifePctOfAvg(communitiesInfo, callback) {
  communitiesPctOfAvg.communitiesPctOfAvg(communitiesInfo,
                                          getVenuesPerLandArea,
                                          function(err, result) {
    return callback(err, result);
  });
}

module.exports = {
  communitiesNightlifePctOfAvg: communitiesNightlifePctOfAvg
};
