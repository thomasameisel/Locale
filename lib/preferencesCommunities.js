/**
 * Created by Tommy on 2/7/2016.
 */
var async = require('async');

var rankCommunities = require('./rankCommunities');
var db = require('./db');

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

communitiesByPreferences(
    {crimePctOfAvg: ['<','0.5'],
    nightlifePctOfAvg: ['<','0.8'],
    pricePctOfAvg: ['<','1.5'],
    crowdedPctOfAvg: ['<','0.8']},
    function(err,result) {
  console.log(result);
});

module.exports = {
  communitiesByPreferences: communitiesByPreferences
};
