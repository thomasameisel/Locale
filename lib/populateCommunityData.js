/**
 * Created by Tommy on 2/3/2016.
 */
var async = require('async');
var db = require('./db');
var nightlife = require('./nightlife');
var tribuneData = require('./tribuneData');
var truliaData = require('./truliaData');
var normalizeData = require('./normalizeData');
var noiseData = require('./noiseData');

function getAllExternalData(communitiesInfo, callback) {
  var allExternalData = {};
  async.parallel([
    // function(cb) {
    //   nightlife.communitiesNightlifePctOfAvg(communitiesInfo,
    //       function(err, result) {
    //     if (err) {
    //       return cb(err);
    //     } else {
    //       console.log('finished nightlife');
    //       allExternalData.nightlifePctOfAvg = result;
    //       return cb();
    //     }
    //   });
    // },
    function(cb) {
      noiseData.communitiesNoisePctOfAvg(function(err, result) {
        if (err) {
          return cb(err);
        } else {
          console.log('finished noise');
          allExternalData.noisePctOfAvg = result;
          return cb();
        }
      });
    },
    function(cb) {
      tribuneData.communitiesCrimePctOfAvg(communitiesInfo,
          function(err, violentResult, nonViolentResult) {
        if (err) {
          return cb(err);
        } else {
          console.log('finished crime');
          allExternalData.violentCrimePctOfAvg = violentResult;
          allExternalData.nonViolentCrimePctOfAvg = nonViolentResult;
          return cb();
        }
      });
    },
    function(cb) {
      tribuneData.communitiesCrowdedPctOfAvg(communitiesInfo,
          function(err, result) {
        if (err) {
          return cb(err);
        } else {
          console.log('finished crowded');
          allExternalData.crowdedPctOfAvg = result;
          return cb();
        }
      });
    },
    function(cb) {
      truliaData.communitiesPricePctOfAvg(communitiesInfo,
          function(err, result) {
        if (err) {
          return cb(err);
        } else {
          console.log('finished price');
          allExternalData.pricePctOfAvg = result;
          return cb();
        }
      });
    }
  ], function(err) {
    return callback(err, allExternalData);
  });
}

function getAllCommunityIDs(communitiesInfo) {
  var communityIDs = [];
  for (var i = 0; i < communitiesInfo.length; ++i) {
    communityIDs.push(communitiesInfo[i].communityID);
  }
  communityIDs.push('gmean');
  communityIDs.push('gstddev');
  return communityIDs;
}

function associateDataByCommunity(communityIDs, allExternalData) {
  var dataByCommunity = {};
  for (var i = 0; i < communityIDs.length; ++i) {
    var communityID = communityIDs[i];
    var communityData = {};
    for (var dataType in allExternalData) {
      if (allExternalData.hasOwnProperty(dataType) &&
          allExternalData[dataType][communityID]) {
        communityData[dataType] = allExternalData[dataType][communityID];
      }
    }
    dataByCommunity[communityID] = communityData;
  }
  return dataByCommunity;
}

function insertAllDataIntoDb(city, dataByCommunity, callback) {
  db.insertAllCommunitiesData(city, dataByCommunity);
  return callback();
}

function populateCommunityData(city, callback) {
  async.waterfall([
    async.apply(db.getAllCommunitiesInfo, city),
    function(communitiesInfo, cb) {
      getAllExternalData(communitiesInfo, function(err, result) {
        if (err) {
          return cb(err);
        } else {
          var allExternalData = normalizeData.normalizeData(result);
          var communityIDs = getAllCommunityIDs(communitiesInfo);
          var dataByCommunity = associateDataByCommunity(communityIDs,
                                                          allExternalData);
          return cb(null, city, dataByCommunity);
        }
      });
    },
    insertAllDataIntoDb
  ], function(err) {
    return callback(err);
  });
}

var startTime = new Date().getTime();
populateCommunityData('CHICAGO', function() {
  var endTime = new Date().getTime();
  console.log('Time elapsed:', (endTime - startTime) / 1000, 's');
});

module.exports = {
  populateCommunityData: populateCommunityData
};
