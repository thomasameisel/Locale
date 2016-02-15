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
  async.each(Object.keys(preferences), function(preference, cb) {
    var condition = preference +
      preferences[preference].op +
      preferences[preference].num;
    db.getCommunitiesCondition(condition, function(err, rows) {
      if (err) {
        cb(err);
      } else {
        satisfyingPreferences[preference] = rows;
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

function communitiesByPreferences(preferences, callback) {
  var satisfyingPreferences = {};
  var satisfyingCommunities = {};
  async.series([
    function(cb) {
      getSatisfyingPreferences(preferences, function(err, result) {
        if (err) {
          cb(err);
        } else {
          satisfyingPreferences = result;
          cb();
        }
      });
    },
    function(cb) {
      rankCommunities.indexSatisfyingCommunities(satisfyingPreferences,
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
