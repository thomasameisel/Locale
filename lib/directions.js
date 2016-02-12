/**
 * Created by Tommy on 2/12/2016.
 */
var GoogleMapsAPI = require('googlemaps');
var async = require('async');
var RateLimiter = require('limiter').RateLimiter;

var limiter = new RateLimiter(1, 150);

var gm = new GoogleMapsAPI({
  key: 'AIzaSyDIjIeMxQlnpg9SJofqghnGhMJvrDsDQlo',
  secure: true
});

function drivingTime(origin, drivingPreferences, callback) {
  limiter.removeTokens(1, function(err, remainingCalls) {
    var nineAmDate;
    if (drivingPreferences.mode === 'driving' ||
        drivingPreferences.mode === 'transit') {
      nineAmDate = new Date();
      nineAmDate.setDate(nineAmDate.getDate() + 1);
      nineAmDate.setHours(9);
    }
    drivingPreferences.origin = origin;
    drivingPreferences.departure_time = nineAmDate;
    gm.directions(drivingPreferences, function(err, result) {
      if (err) {
        callback(err);
      } else {
        callback(null, result.routes[0].legs[0].duration.value);
      }
    });
  });
}

// drivingPreferences should have keys destination, mode, and maxTimeMinutes
function getTooFarCommunities(communitiesInfo, drivingPreferences, callback) {
  var tooFarCommunities = [];
  var maxTimeMinutes = drivingPreferences.maxTimeMinutes;
  delete drivingPreferences.maxTimeMinutes;
  async.each(communitiesInfo, function(communityInfo, cb) {
    drivingTime(communityInfo.latLng, drivingPreferences,
                function(err, result) {
      if (err) {
        cb(err);
      } else {
        if ((result / 60) > maxTimeMinutes) {
          tooFarCommunities.push(communityInfo);
        }
        cb();
      }
    });
  }, function(err) {
    if (err) {
      callback(err);
    } else {
      callback(null, tooFarCommunities);
    }
  });
}

module.exports = {
  getTooFarCommunities: getTooFarCommunities
};
