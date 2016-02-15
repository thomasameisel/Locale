/**
 * Created by Tommy on 1/28/2016.
 */
var async = require('async');

var indexedCommunities = [];

function indexProperty(propertyKey, propertyValue, callback) {
  async.each(propertyValue, function(communityInfo, cb) {
    if (!indexedCommunities[communityInfo.communityID]) {
      var pctOfAvgArr = [communityInfo[propertyKey]];
      var correspondingTypeArr = [propertyKey];
      indexedCommunities[communityInfo.communityID] =
      {
        communityID: communityInfo.communityID,
        name: communityInfo.name,
        latLng: communityInfo.latLng,
        radius: communityInfo.radius,
        pctOfAvgArr: pctOfAvgArr,
        correspondingTypeArr: correspondingTypeArr
      };
    } else {
      indexedCommunities[communityInfo.communityID]
          .pctOfAvgArr.push(communityInfo[propertyKey]);
      indexedCommunities[communityInfo.communityID]
          .correspondingTypeArr.push(propertyKey);
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
  if (a.pctOfAvgArr.length < b.pctOfAvgArr.length) {
    return 1;
  } else if (a.pctOfAvgArr.length > b.pctOfAvgArr.length) {
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
      findCommunity(satisfyingPreferences[community.correspondingTypeArr[0]],
                    community.communityID);
  if (communityAllInfo) {
    return communityAllInfo[preference];
  } else {
    return undefined;
  }
}

function addBadPreferencesCommunity(satisfyingPreferences, community,
                                    callback) {
  for (var i = 0;
       i < Object.keys(satisfyingPreferences).length;
       ++i) {
    if (community.correspondingTypeArr
        .indexOf(Object.keys(satisfyingPreferences)[i]) === -1) {
      var pctOfAvg = getPctOfAvgFromPreferences(satisfyingPreferences,
          community,
          Object.keys(satisfyingPreferences)[i]);
      if (!pctOfAvg) {
        callback(community.communityID + ' error adding bad preferences');
      }
      if (!community.badPctOfAvgArr) {
        community.badPctOfAvgArr = [pctOfAvg];
        community.badCorrespondingTypeArr =
            [Object.keys(satisfyingPreferences)[i]];
      } else {
        community.badPctOfAvgArr.push(pctOfAvg);
        community.badCorrespondingTypeArr
            .push(Object.keys(satisfyingPreferences)[i]);
      }
    }
  }
  callback(null, community);
}

function addBadPreferences(indexedCommunities, satisfyingPreferences,
                           callback) {
  var newIndexedCommunities = [];
  async.each(indexedCommunities, function(satisfyingCommunity, cb) {
    if (satisfyingCommunity.correspondingTypeArr.length !==
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
      satisfyingCommunity.badPctOfAvgArr = [];
      satisfyingCommunity.badCorrespondingTypeArr = [];
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