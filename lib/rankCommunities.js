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
        pctOfAvgArr: pctOfAvgArr, correspondingTypeArr: correspondingTypeArr
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
  if (a.pctOfAvgArr < b.pctOfAvgArr) {
    return -1;
  } else if (a.pctOfAvgArr > b.pctOfAvgArr) {
    return 1;
  } else {
    return 0;
  }
}

/* Keys in satisfyingProperties must have the same name
 as the keys in the communityInfo object
 ex. satisfyingProperties=
    {nightlifePctOfAvg:[{communityID:1,nightlifePctOfAvg:2,crimePctOfAvg:1}],
 crimePctOfAvg:[{communityID:2,nightlifePctOfAvg:0.5,crimePctOfAvg:0.3}]}
*/
function indexSatisfyingCommunities(satisfyingProperties, callback) {
  indexedCommunities.length = 0;
  async.each(Object.keys(satisfyingProperties),
      function(satisfyingProperty, cb) {
    indexProperty(satisfyingProperty, satisfyingProperties[satisfyingProperty],
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
      callback(null, indexedCommunities);
    }
  });
}

module.exports = {
  indexSatisfyingCommunities: indexSatisfyingCommunities
};