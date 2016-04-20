/**
 * Created by Tommy on 1/28/2016.
 */
var normalizeData = require('./normalizeData');

function indexProperty(preferences, propertyKey, propertyValue, gMeanStdDev,
                       indexedCommunities) {
  for (var i = 0; i < propertyValue.length; ++i) {
    var communityInfo = propertyValue[i];
    var pctOfAvg = normalizeData.convertToPctOfAvg(
      gMeanStdDev.gmean[propertyKey],
      gMeanStdDev.gstddev[propertyKey],
      communityInfo[propertyKey]);
    if (!isNaN(pctOfAvg)) {
      if (!indexedCommunities[communityInfo.communityID]) {
        indexedCommunities[communityInfo.communityID] =
            {
              communityID: communityInfo.communityID,
              name: communityInfo.name,
              outline: JSON.parse(communityInfo.outline),
              allCriteria: {},
              goodCriteria: {},
              badCriteria: {},
              numSatisfying: 0
            };
      }
      indexedCommunities[communityInfo.communityID]
        .allCriteria[propertyKey] = {
        value: pctOfAvg
      };
      if (isGoodCriteria(preferences, propertyKey, pctOfAvg)) {
        indexedCommunities[communityInfo.communityID]
          .goodCriteria[propertyKey] = pctOfAvg;
        indexedCommunities[communityInfo.communityID]
          .allCriteria[propertyKey].good = true;
      } else {
        indexedCommunities[communityInfo.communityID]
          .badCriteria[propertyKey] = pctOfAvg;
        indexedCommunities[communityInfo.communityID]
          .allCriteria[propertyKey].good = false;
      }
      ++indexedCommunities[communityInfo.communityID].numSatisfying;
    }
  }
  return indexedCommunities;
}

function isGoodCriteria(preferences, propertyKey, criteriaValue) {
  if (preferences[propertyKey].op === '>') {
    return criteriaValue > 1;
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
  if (communityAllInfo && communityAllInfo[preference]) {
    return normalizeData.convertToPctOfAvg(gMeanStdDev.gmean[preference],
                                            gMeanStdDev.gstddev[preference],
                                            communityAllInfo[preference]);
  } else {
    return undefined;
  }
}

function addBadPreferencesCommunity(preferences, satisfyingPreferences,
                                    gMeanStdDev, community) {
  var preference = (Object.keys(community.goodCriteria).length > 0) ?
                    Object.keys(community.goodCriteria)[0] :
                    Object.keys(community.badCriteria)[0];
  var communityAllInfo = findCommunity(satisfyingPreferences[preference],
                                        community.communityID);
  for (var preferenceKey in satisfyingPreferences) {
    if (satisfyingPreferences.hasOwnProperty(preferenceKey)) {
      if (!community.goodCriteria[preferenceKey] &&
          !community.badCriteria[preferenceKey]) {
        var pctOfAvg = getPctOfAvgFromPreferences(gMeanStdDev, communityAllInfo,
                                                  preferenceKey);
        if (pctOfAvg) {
          community.allCriteria[preferenceKey] = {
            value: pctOfAvg
          };
          if (isGoodCriteria(preferences, preferenceKey, pctOfAvg)) {
            community.allCriteria[preferenceKey].good = true;
            community.goodCriteria[preferenceKey] = pctOfAvg;
          } else {
            community.allCriteria[preferenceKey].good = false;
            community.badCriteria[preferenceKey] = pctOfAvg;
          }
        }
      }
    }
  }
  return community;
}

function addBadPreferences(preferences, indexedCommunities, gMeanStdDev,
                           satisfyingPreferences) {
  var newIndexedCommunities = [];
  for (var i = 0; i < indexedCommunities.length; ++i) {
    if ((Object.keys(indexedCommunities[i].goodCriteria).length +
        Object.keys(indexedCommunities[i].badCriteria).length) !==
        Object.keys(satisfyingPreferences).length) {
      newIndexedCommunities.push(addBadPreferencesCommunity(preferences,
          satisfyingPreferences,
          gMeanStdDev,
          indexedCommunities[i]));
    }
  }
  return newIndexedCommunities;
}

function sortAllCriteriaCommunity(communityPreferences) {
  var orderPreferences = [
    'violentCrimePctOfAvg',
    'nonViolentCrimePctOfAvg',
    'nightlifePctOfAvg',
    'pricePctOfAvg',
    'crowdedPctOfAvg'
  ];
  var orderedAllCriteria = {};
  var unorderedAllCriteria = communityPreferences.allCriteria;
  for (var i = 0; i < orderPreferences.length; ++i) {
    if (unorderedAllCriteria[orderPreferences[i]]) {
      orderedAllCriteria[orderPreferences[i]] =
          unorderedAllCriteria[orderPreferences[i]];
    }
  }
  return orderedAllCriteria;
}

function sortAllCriteria(preferences) {
  for (var i = 0; i < preferences.length; ++i) {
    preferences[i].allCriteria = sortAllCriteriaCommunity(preferences[i]);
  }
  return preferences;
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
  for (var satisfyingPreference in satisfyingPreferences) {
    if (satisfyingPreferences.hasOwnProperty(satisfyingPreference)) {
      indexedCommunities = indexProperty(preferences, satisfyingPreference,
          satisfyingPreferences[satisfyingPreference], gMeanStdDev,
          indexedCommunities);
    }
  }
  indexedCommunities.sort(sortLengthArr);
  indexedCommunities = removeTrailingNull(indexedCommunities);
  var badPreferences = addBadPreferences(preferences, indexedCommunities, gMeanStdDev,
                                         satisfyingPreferences);
  return sortAllCriteria(badPreferences);
}

module.exports = {
  indexSatisfyingCommunities: indexSatisfyingCommunities
};
