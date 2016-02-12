/**
 * Created by Tommy on 2/7/2016.
 */
var async = require('async');

var directions = require('./directions');
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
function getSatisfyingPreferences(preferences, tooFarCommunities, callback) {
  var satisfyingPreferences = {};
  var tooFarCommunitiesCondition;
  if (tooFarCommunities) {
    tooFarCommunitiesCondition = communitiesToNotCondition(tooFarCommunities);
  }
  async.each(Object.keys(preferences), function(preference, cb) {
    var condition = preference +
      (preferences[preference])[0] +
      (preferences[preference])[1];
    if (tooFarCommunitiesCondition) {
      condition += ' and ';
      condition += tooFarCommunitiesCondition;
    }
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

function communitiesToNotCondition(tooFarCommunities) {
  if (tooFarCommunities) {
    var condition = '';
    for (var i = 0; i < tooFarCommunities.length; ++i) {
      condition += 'communityID<>' + tooFarCommunities[i].communityID;
      if (i < (tooFarCommunities.length - 1)) {
        condition += ' and ';
      }
    }
    return condition;
  } else {
    return undefined;
  }
}

function getTooFarCommunities(drivingPreferences, callback) {
  if (drivingPreferences) {
    db.getAllCommunitiesInfo(function(err, communitiesInfo) {
      if (err) {
        callback(err);
      } else {
        directions.getTooFarCommunities(communitiesInfo, drivingPreferences,
                                        function(err, result) {
          if (err) {
            callback(err);
          } else {
            callback(null, result);
          }
        });
      }
    });
  } else {
    callback(null, undefined);
  }
}

function communitiesByPreferences(preferences, drivingPreferences, callback) {
  var satisfyingPreferences = {};
  var tooFarCommunities = [];
  var satisfyingCommunities = {};
  async.series([
    function(cb) {
      getTooFarCommunities(drivingPreferences, function(err, result) {
        if (err) {
          cb(err);
        } else {
          tooFarCommunities = result;
          cb();
        }
      });
    },
    function(cb) {
      getSatisfyingPreferences(preferences, tooFarCommunities,
                                function(err, result) {
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
    {
      crimePctOfAvg: ['<',0.6],
      nightlifePctOfAvg: ['>',1.4],
      pricePctOfAvg: ['<',1.5],
      crowdedPctOfAvg: ['<',0.6]
    },
    {
      destination: '201 S Wacker Dr, Chicago, IL',
      mode: 'transit',
      maxTimeMinutes: 30
    },
    function(err,result) {
  console.log(result);
});

module.exports = {
  communitiesByPreferences: communitiesByPreferences
};
