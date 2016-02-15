/**
 * Created by Tommy on 2/7/2016.
 */
var async = require('async');

var rankCommunities = require('./rankCommunities');
var db = require('./db');

/* preferences object should have keys that specify the type that is
 being compared in the condition and values that is an array with
 the first element as the comparison operator and the second element
 as the number that is being compared
 ex. {crimePctOfAvg: ['<',1.4],
      nightlifePctOfAvg: ['>',1.5],
      pricePctOfAvg: ['<',0.6],
      crowdedPctOfAvg: ['<',1.5]}
 */
function getSatisfyingPreferences(preferences, callback) {
  var satisfyingPreferences = {};
  async.each(Object.keys(preferences), function(preference, cb) {
    var condition = preference +
      (preferences[preference])[0] +
      (preferences[preference])[1];
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
    {
      violentCrimePctOfAvg: ['<',0.6],
      nonViolentCrimePctOfAvg: ['<',1],
      nightlifePctOfAvg: ['>',1.4],
      pricePctOfAvg: ['<',1.2],
      crowdedPctOfAvg: ['<',0.6]
    },
    function(err,result) {
  console.log(result);
});*/

module.exports = {
  communitiesByPreferences: communitiesByPreferences
};
