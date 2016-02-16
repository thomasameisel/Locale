/**
 * Created by Tommy on 1/28/2016.
 */
var async = require('async');

var indexedCommunities = [];

function indexProperty(propertyKey, propertyValue, callback) {
  async.each(propertyValue, function(communityInfo, cb) {
    if (!indexedCommunities[communityInfo.communityID]) {
      var satisfyingPreference = {};
      satisfyingPreference[propertyKey] = communityInfo[propertyKey];
      indexedCommunities[communityInfo.communityID] =
          {
            communityID: communityInfo.communityID,
            name: communityInfo.name,
            latLng: communityInfo.latLng,
            radius: communityInfo.radius,
            satisfyingPreferences: satisfyingPreference
          };
    } else {
      indexedCommunities[communityInfo.communityID]
          .satisfyingPreferences[propertyKey] = communityInfo[propertyKey];
    }
    cb();
  }, function(err) {
    if (err) {
      callback(err);
    } else {
      callback();
    }
  });
}

function sortLengthArr(a, b) {
  var aSatisfyingPreferencesLen = Object.keys(a.satisfyingPreferences).length;
  var bSatisfyingPreferencesLen = Object.keys(b.satisfyingPreferences).length;
  if (aSatisfyingPreferencesLen < bSatisfyingPreferencesLen) {
    return 1;
  } else if (aSatisfyingPreferencesLen > bSatisfyingPreferencesLen) {
    return -1;
  } else {
    return 0;
  }
}

function removeTrailingNull(arr) {
  for (var i = 0; i < arr.length; ++i) {
    if (arr[i] === undefined) {
      return arr.slice(0, i);
    }
  }
}

function findCommunity(communities, communityID) {
  for (var i = 0; i < communities.length; ++i) {
    if (communities[i].communityID === communityID) {
      return communities[i];
    }
  }
  return undefined;
}

function getPctOfAvgFromPreferences(satisfyingPreferences, community,
                                    preference) {
  var communityAllInfo =
      findCommunity(
        satisfyingPreferences[Object.keys(community.satisfyingPreferences)[0]],
        community.communityID);
  if (communityAllInfo) {
    if (!communityAllInfo[preference]) {
      // data could not be found for community
      return -1;
    } else {
      return communityAllInfo[preference];
    }
  } else {
    return undefined;
  }
}

function addBadPreferencesCommunity(satisfyingPreferences, community,
                                    callback) {
  for (var i = 0;
       i < Object.keys(satisfyingPreferences).length;
       ++i) {
    if (!community.satisfyingPreferences
        [Object.keys(satisfyingPreferences)[i]]) {
      var pctOfAvg = getPctOfAvgFromPreferences(satisfyingPreferences,
          community,
          Object.keys(satisfyingPreferences)[i]);
      if (!pctOfAvg) {
        return callback(community.communityID +
                        ' community: error adding bad preferences');
      }
      if (!community.badPreferences) {
        community.badPreferences = {};
      }
      community.badPreferences[Object.keys(satisfyingPreferences)[i]] =
          pctOfAvg;
    }
  }
  callback(null, community);
}

function addBadPreferences(indexedCommunities, satisfyingPreferences,
                           callback) {
  var newIndexedCommunities = [];
  async.each(indexedCommunities, function(satisfyingCommunity, cb) {
    if (Object.keys(satisfyingCommunity.satisfyingPreferences).length !==
        Object.keys(satisfyingPreferences).length) {
      addBadPreferencesCommunity(satisfyingPreferences, satisfyingCommunity,
                                  function(err, result) {
        if (err) {
          cb(err);
        } else {
          newIndexedCommunities.push(result);
          cb();
        }
      });
    } else {
      satisfyingCommunity.badPrefences = {};
      newIndexedCommunities.push(satisfyingCommunity);
      cb();
    }
  }, function(err) {
    if (err) {
      callback(err);
    } else {
      callback(null, newIndexedCommunities);
    }
  });
}

/* Keys in satisfyingProperties must have the same name
 as the keys in the communityInfo object
 ex. satisfyingProperties=
 {nightlifePctOfAvg:[{communityID:1,nightlifePctOfAvg:2,crimePctOfAvg:1}],
 crimePctOfAvg:[{communityID:2,nightlifePctOfAvg:0.5,crimePctOfAvg:0.3}]}
 */
function indexSatisfyingCommunities(satisfyingPreferences, callback) {
  indexedCommunities.length = 0;
  async.each(Object.keys(satisfyingPreferences),
              function(satisfyingPreference, cb) {
    indexProperty(satisfyingPreference,
                  satisfyingPreferences[satisfyingPreference],
                  function(err) {
      if (err) {
        cb(err);
      } else {
        cb();
      }
    });
  }, function(err) {
    if (err) {
      callback(err);
    } else {
      indexedCommunities.sort(sortLengthArr);
      indexedCommunities = removeTrailingNull(indexedCommunities);
      addBadPreferences(indexedCommunities, satisfyingPreferences,
                        function(err, result) {
        if (err) {
          callback(err);
        } else {
          callback(null, result);
        }
      });
    }
  });
}

module.exports = {
  indexSatisfyingCommunities: indexSatisfyingCommunities
};