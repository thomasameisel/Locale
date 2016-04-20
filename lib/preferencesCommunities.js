/**
 * Created by Tommy on 2/7/2016.
 */
var async = require('async');

var normalizeData = require('./normalizeData');
var rankCommunities = require('./rankCommunities');
var db = require('./db');

/* preferences =
 ex. { violentCrime: { op: '<', num: '4' },
       nonViolentCrime: { op: '<', num: '3' },
       nightlife: { op: '>', num: '4' },
       price: { op: '<', num: '4' },
       crowded: { op: '<', num: '2' } }
 */
function getSatisfyingPreferences(city, preferences, callback) {
  var satisfyingPreferences = {};
  async.forEachOf(preferences, function(preferenceVal, preferenceKey, cb) {
    var condition = preferenceKey + preferenceVal.op + preferenceVal.num;
    db.getCommunitiesCondition(city, condition, function(err, rows) {
      if (err) {
        return cb(err);
      } else {
        satisfyingPreferences[preferenceKey] = rows;
        return cb();
      }
    });
  }, function(err) {
    return callback(err, satisfyingPreferences);
  });
}

function convertPreferences(preferences) {
  // maybe use something with std dev later
  var convertedPreferences = preferences;
  for (var key in preferences) {
    if (preferences.hasOwnProperty(key)) {
      var convertedValue;
      switch (parseInt(preferences[key].num)) {
        case 1: {
          convertedValue = -1.5;
          break;
        }
        case 2: {
          convertedValue = -0.5;
          break;
        }
        case 3: {
          convertedValue = 0;
          break;
        }
        case 4: {
          convertedValue = 0.5;
          break;
        }
        case 5: {
          convertedValue = 1.5;
          break;
        }
        default: {
          convertedValue = 0;
        }
      }
      convertedPreferences[key].num = convertedValue;
    }
  }
  return convertedPreferences;
}

function normalizePreferences(preferences, gMeanStdDev) {
  var normalizedPreferences = {};
  for (var preference in preferences) {
    if (preferences.hasOwnProperty(preference)) {
      normalizedPreferences[preference] = normalizeData.convertToPctOfAvg(gMeanStdDev.gmean[preference],
          gMeanStdDev.gstddev[preference],
          preferences[preference].num);
    }
  }
  return normalizedPreferences;
}

function communitiesByPreferences(preferences, callback) {
  var city = preferences.city;
  delete preferences.city;
  var convertedPreferences = convertPreferences(preferences);
  async.waterfall([
    async.apply(getSatisfyingPreferences, city, convertedPreferences),
    function(satisfyingPreferences, cb) {
      db.getPreferencesStatistics(city, function(err, gMeanStdDev) {
        if (err) {
          return cb(err);
        } else {
          var result = {};
          result.satisfyingPreferences = satisfyingPreferences;
          result.gMeanStdDev = gMeanStdDev;
          return cb(null, result);
        }
      });
    }
  ], function(err, result) {
    if (err) {
      return callback(err);
    } else {
      var normalizedPreferences =
          normalizePreferences(convertedPreferences, result.gMeanStdDev);
      var indexedCommunities = rankCommunities
          .indexSatisfyingCommunities(preferences,
                                      result.satisfyingPreferences,
                                      result.gMeanStdDev);
      for (var i = 0; i < indexedCommunities.length; ++i) {
        indexedCommunities[i].normalizedPreferences = normalizedPreferences;
      }
      return callback(null, indexedCommunities);
    }
  });
}

/*var now = new Date();
communitiesByPreferences(
    { violentCrimePctOfAvg: { op: '<', num: '4' },
      nonViolentCrimePctOfAvg: { op: '<', num: '3' },
      nightlifePctOfAvg: { op: '>', num: '4' },
      pricePctOfAvg: { op: '<', num: '4' },
      crowdedPctOfAvg: { op: '<', num: '2' } },
    function(err,result) {
  var end = new Date();
  console.log(result);
  console.log((end - now) / 1000);
});*/

module.exports = {
  communitiesByPreferences: communitiesByPreferences
};
