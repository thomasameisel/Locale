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
      types: 'bar|casino|night_club',
      pagetoken: pageToken
    };
    places.nearbySearch(parameters, function(err, response) {
      callback(err, response);
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
            cb(err);
          } else {
            pageToken = result.body.next_page_token;
            numVenues += result.body.results.length;
            cb();
          }
        });
    },
    function() { return typeof pageToken !== 'undefined'; },
    function(err) { callback(err, (numVenues / landArea)); }
  );
}

function communitiesNightlifePctOfAvg(communitiesInfo, callback) {
  communitiesPctOfAvg.communitiesPctOfAvg(communitiesInfo,
      getVenuesPerLandArea,
      function(err, result) {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
}

module.exports = {
  communitiesNightlifePctOfAvg: communitiesNightlifePctOfAvg
};