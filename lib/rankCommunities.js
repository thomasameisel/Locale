/**
 * Created by Tommy on 1/28/2016.
 */
var async = require('async');
var normalizeData = require('./normalizeData');

function indexProperty(preferences, propertyKey, propertyValue, gMeanStdDev,
                       indexedCommunities, callback) {
  async.each(propertyValue, function(communityInfo, cb) {
    var zScore = normalizeData.convertToPctOfAvg(gMeanStdDev.gmean[propertyKey],
        gMeanStdDev.gstddev[propertyKey],
        communityInfo[propertyKey]);
    if (!indexedCommunities[communityInfo.communityID]) {
      indexedCommunities[communityInfo.communityID] =
          {
            communityID: communityInfo.communityID,
            name: communityInfo.name,
            latLng: communityInfo.latLng,
            radius: communityInfo.radius,
            goodCriteria: {},
            badCriteria: {},
            numSatisfying: 0
          };
    }
    if (isGoodCriteria(preferences, propertyKey, zScore)) {
      indexedCommunities[communityInfo.communityID]
          .goodCriteria[propertyKey] = zScore;
    } else {
      indexedCommunities[communityInfo.communityID]
          .badCriteria[propertyKey] = zScore;
    }
    ++indexedCommunities[communityInfo.communityID].numSatisfying;
    cb();
  }, function(err) {
    if (err) {
      callback(err);
    } else {
      callback(null, indexedCommunities);
    }
  });
}

function isGoodCriteria(preferences, propertyKey, criteriaValue) {
  if (propertyKey === 'nightlifePctOfAvg') {
    if (preferences.nightlifePctOfAvg.op === '<') {
      return criteriaValue <= 1;
    } else {
      return criteriaValue > 1;
    }
  } else {
    return criteriaValue <= 1;
  }
}

function sortLengthArr(a, b) {
  var aSatisfyingPreferences = a.numSatisfying;
  var bSatisfyingPreferences = b.numSatisfying;
  if (aSatisfyingPreferences < bSatisfyingPreferences) {
    return 1;
  } else if (aSatisfyingPreferences > bSatisfyingPreferences) {
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

function getPctOfAvgFromPreferences(gMeanStdDev, communityAllInfo, preference) {
  if (communityAllInfo) {
    if (!communityAllInfo[preference]) {
      // data could not be found for community
      return undefined;
    } else {
      return normalizeData.convertToPctOfAvg(gMeanStdDev.gmean[preference],
                                              gMeanStdDev.gstddev[preference],
                                              communityAllInfo[preference]);
    }
  } else {
    return undefined;
  }
}

function addBadPreferencesCommunity(preferences, satisfyingPreferences,
                                    gMeanStdDev, community, callback) {
  var preference = (Object.keys(community.goodCriteria).length > 0) ?
                    Object.keys(community.goodCriteria)[0] :
                    Object.keys(community.badCriteria)[0];
  var communityAllInfo = findCommunity(satisfyingPreferences[preference],
                                        community.communityID);
  async.forEachOf(satisfyingPreferences, function(preferenceVal, preferenceKey,
                                                  cb) {
    if (!community.goodCriteria[preferenceKey] &&
        !community.badCriteria[preferenceKey]) {
      var pctOfAvg = getPctOfAvgFromPreferences(gMeanStdDev, communityAllInfo,
                                                preferenceKey);
      if (pctOfAvg) {
        if (isGoodCriteria(preferences, preferenceKey, pctOfAvg)) {
          community.goodCriteria[preferenceKey] = pctOfAvg;
        } else {
          community.badCriteria[preferenceKey] = pctOfAvg;
        }
      }
    }
    cb();
  }, function(err) {
    if (err) {
      callback(err);
    } else {
      callback(null, community);
    }
  });
}

function addBadPreferences(preferences, indexedCommunities, gMeanStdDev,
                           satisfyingPreferences, callback) {
  var newIndexedCommunities = [];
  async.each(indexedCommunities, function(satisfyingCommunity, cb) {
    if ((Object.keys(satisfyingCommunity.goodCriteria).length +
            Object.keys(satisfyingCommunity.badCriteria).length) !==
        Object.keys(satisfyingPreferences).length) {
      addBadPreferencesCommunity(preferences, satisfyingPreferences,
                                  gMeanStdDev, satisfyingCommunity,
                                  function(err, result) {
        if (err) {
          console.error(err);
          newIndexedCommunities.push(satisfyingCommunity);
        } else {
          newIndexedCommunities.push(result);
        }
      });
    } else {
      newIndexedCommunities.push(satisfyingCommunity);
    }
    cb();
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
function indexSatisfyingCommunities(preferences, satisfyingPreferences,
                                    gMeanStdDev, callback) {
  var indexedCommunities = [];
  async.forEachOf(satisfyingPreferences, function(satisfyingPreferenceVal,
                                                  satisfyingPreferenceKey, cb) {
    indexProperty(preferences, satisfyingPreferenceKey, satisfyingPreferenceVal,
                  gMeanStdDev, indexedCommunities, function(err, result) {
      if (err) {
        cb(err);
      } else {
        indexedCommunities = result;
        cb();
      }
    });
  }, function(err) {
    if (err) {
      callback(err);
    } else {
      indexedCommunities.sort(sortLengthArr);
      indexedCommunities = removeTrailingNull(indexedCommunities);
      addBadPreferences(preferences, indexedCommunities, gMeanStdDev,
                        satisfyingPreferences, function(err, result) {
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