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
    convertedPreferences[key].num = (value.num / 3);
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
      rankCommunities.indexSatisfyingCommunities(convertedPreferences,
                                                  satisfyingPreferences,
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

/*communitiesByPreferences(
    { violentCrime: { op: '<', num: '4' },
    nonViolentCrime: { op: '<', num: '3' },
    nightlife: { op: '>', num: '4' },
    price: { op: '<', num: '4' },
    crowded: { op: '<', num: '2' } },
    function(err,result) {
  console.log(result);
});*/

module.exports = {
  communitiesByPreferences: communitiesByPreferences
};
