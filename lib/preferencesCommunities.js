/**
 * Created by Tommy on 2/7/2016.
 */
var async = require('async');

var rankCommunities = require('./rankCommunities');
var db = require('./db');

/* preferences =
 ex. { violentCrime: { op: '<', num: '4' },
       nonViolentCrime: { op: '<', num: '3' },
       nightlife: { op: '>', num: '4' },
       price: { op: '<', num: '4' },
       crowded: { op: '<', num: '2' } }
 */
function getSatisfyingPreferences(preferences, callback) {
  var satisfyingPreferences = {};
  async.forEachOf(preferences, function(preferenceVal, preferenceKey, cb) {
    var condition = preferenceKey + preferenceVal.op + preferenceVal.num;
    db.getCommunitiesCondition(condition, function(err, rows) {
      if (err) {
        cb(err);
      } else {
        satisfyingPreferences[preferenceKey] = rows;
        cb();
      }
    });
  }, function(err) {
    if (err) {
      callback(err);
    } else {
      callback(null, satisfyingPreferences);
    }
  });
}

function convertPreferences(preferences, callback) {
  // maybe use something with std dev later
  var convertedPreferences = preferences;
  async.forEachOf(preferences, function(value, key, cb) {
    var convertedValue;
    switch (parseInt(value.num)) {
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
    cb();
  }, function(err) {
    if (err) {
      callback(err);
    } else {
      callback(null, convertedPreferences);
    }
  });
}

function communitiesByPreferences(preferences, callback) {
  var convertedPreferences = {};
  var satisfyingPreferences = {};
  var gMeanStdDev = {};
  var satisfyingCommunities = {};
  async.series([
    function(cb) {
      convertPreferences(preferences, function(err, result) {
        if (err) {
          cb(err);
        } else {
          convertedPreferences = result;
          cb();
        }
      });
    },
    function(cb) {
      getSatisfyingPreferences(convertedPreferences, function(err, result) {
        if (err) {
          cb(err);
        } else {
          satisfyingPreferences = result;
          cb();
        }
      });
    },
    function(cb) {
      db.getPreferencesStatistics(function(err, result) {
        if (err) {
          cb(err);
        } else {
          gMeanStdDev = result;
          cb();
        }
      });
    },
    function(cb) {
      rankCommunities.indexSatisfyingCommunities(preferences,
                                                  satisfyingPreferences,
                                                  gMeanStdDev,
                                                  function(err, result) {
        if (err) {
          cb(err);
        } else {
          satisfyingCommunities = result;
          cb();
        }
      });
    }
  ], function(err) {
    if (err) {
      callback(err);
    } else {
      callback(null, satisfyingCommunities);
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
