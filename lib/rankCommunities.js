/**
 * Created by Tommy on 1/28/2016.
 */
var normalizeData = require('./normalizeData');

function indexCommunities(communities, gMeanStdDev,
                          indexedCommunities) {
  for (var i = 0; i < communities.length; ++i) {
    var communityInfo = communities[i];
    if (!indexedCommunities[communityInfo.communityID]) {
      indexedCommunities[communityInfo.communityID] =
          initializeCommunity(communityInfo, gMeanStdDev);
    }
    ++indexedCommunities[communityInfo.communityID].numSatisfying;
  }
  return indexedCommunities;
}

function initializeCommunity(communityInfo, gMeanStdDev) {
  var orderCriteria = [
    'violentCrimePctOfAvg',
    'nonViolentCrimePctOfAvg',
    'nightlifePctOfAvg',
    'pricePctOfAvg',
    'crowdedPctOfAvg'
  ];
  var community =
    {
      communityID: communityInfo.communityID,
      name: communityInfo.name,
      outline: JSON.parse(communityInfo.outline),
      allCriteria: {},
      numSatisfying: 0
    };
  for (var i = 0; i < orderCriteria.length; ++i) {
    if (communityInfo[orderCriteria[i]]) {
      var pctOfAvg = normalizeData.convertToPctOfAvg(
        gMeanStdDev.gmean[orderCriteria[i]],
        gMeanStdDev.gstddev[orderCriteria[i]],
        communityInfo[orderCriteria[i]]);
      if (!isNaN(pctOfAvg)) {
        community.allCriteria[orderCriteria[i]] = pctOfAvg;
      }
    }
  }
  return community;
}

function sortNumCriteriaSatisfying(a, b) {
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

/* Keys in communitiesSatisfyingCriteria must have the same name
 as the keys in the communityInfo object
 ex. communitiesSatisfyingCriteria=
 {nightlifePctOfAvg:[{communityID:1,nightlifePctOfAvg:2,crimePctOfAvg:1}],
 crimePctOfAvg:[{communityID:2,nightlifePctOfAvg:0.5,crimePctOfAvg:0.3}]}
 */
function indexSatisfyingCommunities(communitiesSatisfyingCriteria,
                                    gMeanStdDev) {
  var indexedCommunities = [];
  for (var criteria in communitiesSatisfyingCriteria) {
    if (communitiesSatisfyingCriteria.hasOwnProperty(criteria)) {
      indexedCommunities = indexCommunities(
          communitiesSatisfyingCriteria[criteria], gMeanStdDev,
          indexedCommunities);
    }
  }
  indexedCommunities.sort(sortNumCriteriaSatisfying);
  return removeTrailingNull(indexedCommunities);
}

module.exports = {
  indexSatisfyingCommunities: indexSatisfyingCommunities
};
