/**
 * Created by Tommy on 2/12/2016.
 */
var GoogleMapsAPI = require('googlemaps');
var async = require('async');
var RateLimiter = require('limiter').RateLimiter;

var limiterPerSecond = new RateLimiter(1, 150);
var limiterPerDay = new RateLimiter(2470, 'day');

var gm = new GoogleMapsAPI({
  key: 'AIzaSyDIjIeMxQlnpg9SJofqghnGhMJvrDsDQlo',
  secure: true
});

function drivingTime(origin, drivingPreferences, callback) {
  limiterPerSecond.removeTokens(1, function() {
    var nineAmDate;
    if (drivingPreferences.mode === 'driving' ||
        drivingPreferences.mode === 'transit') {
      nineAmDate = new Date();
      nineAmDate.setDate(nineAmDate.getDate() + 1);
      nineAmDate.setHours(9);
    }
    drivingPreferences.origin = origin;
    drivingPreferences.departure_time = nineAmDate;
    limiterPerDay.removeTokens(1, function() {
      gm.directions(drivingPreferences, function(err, result) {
        if (err) {
          return callback(err);
        } else {
          return callback(null, result.routes[0].legs[0].duration.value);
        }
      });
    });
  });
}

// drivingPreferences should have keys destination and mode
function getTimeToCommunities(communitiesInfo, drivingPreferences, callback) {
  var timeToCommunities = [];
  async.eachSeries(communitiesInfo, function(communityInfo, cb) {
    drivingTime(communityInfo.latLng, drivingPreferences,
                function(err, result) {
      if (err) {
        return cb('Error, destination is probably in the water ' +
                  drivingPreferences.destination);
      } else {
        timeToCommunities[communityInfo.communityID] = (result / 60);
        return cb();
      }
    });
  }, function(err) {
    return callback(err, timeToCommunities);
  });
}

module.exports = {
  getTimeToCommunities: getTimeToCommunities
};
