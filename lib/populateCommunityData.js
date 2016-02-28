/**
 * Created by Tommy on 2/3/2016.
 */
var async = require('async');
var db = require('./db');
var nightlife = require('./nightlife');
var tribuneData = require('./tribuneData');
var truliaData = require('./truliaData');
var normalizeData = require('./normalizeData');

function getAllExternalData(communitiesInfo, callback) {
  var allExternalData = {};
  async.parallel([
    function(cb) {
      nightlife.communitiesNightlifePctOfAvg(communitiesInfo,
          function(err, result) {
        if (err) {
          cb(err);
        } else {
          allExternalData.nightlifePctOfAvg = result;
          cb();
        }
      });
    },
    function(cb) {
      tribuneData.communitiesCrimePctOfAvg(communitiesInfo,
          function(err, violentResult, nonViolentResult) {
        if (err) {
          cb(err);
        } else {
          allExternalData.violentCrimePctOfAvg = violentResult;
          allExternalData.nonViolentCrimePctOfAvg = nonViolentResult;
          cb();
        }
      });
    },
    function(cb) {
      tribuneData.communitiesCrowdedPctOfAvg(communitiesInfo,
          function(err, result) {
        if (err) {
          cb(err);
        } else {
          allExternalData.crowdedPctOfAvg = result;
          cb();
        }
      });
    },
    function(cb) {
      truliaData.communitiesPricePctOfAvg(communitiesInfo,
          function(err, result) {
        if (err) {
          cb(err);
        } else {
          allExternalData.pricePctOfAvg = result;
          cb();
        }
      });
    }
  ], function(err) {
    callback(err, allExternalData);
  });
}

function getAllCommunityIDs(communitiesInfo, callback) {
  var communityIDs = [];
  for (var i = 0; i < communitiesInfo.length; ++i) {
    communityIDs.push(communitiesInfo[i].communityID);
  }
  communityIDs.push('gmean');
  communityIDs.push('gstddev');
  callback(null, communityIDs);
}

function associateDataByCommunity(communityIDs, allExternalData, callback) {
  var dataByCommunity = {};
  async.each(communityIDs, function(communityID, cb) {
    var communityData = {};
    for (var dataType in allExternalData) {
      if (allExternalData[dataType][communityID]) {
        communityData[dataType] = allExternalData[dataType][communityID];
      }
    }
    dataByCommunity[communityID] = communityData;
    cb();
  }, function() {
    callback(null, dataByCommunity);
  });
}

function insertAllDataIntoDb(dataByCommunity, callback) {
  db.insertAllCommunitiesData(dataByCommunity);
  callback();
}

function populateCommunityData(callback) {
  var communitiesInfo = [];
  var allExternalData = {};
  var communityIDs = [];
  var dataByCommunity = {};
  async.series([
    function(cb) {
      db.getAllCommunitiesInfo(function(err, rows) {
        if (err) {
          cb(err);
        } else {
          communitiesInfo = rows;
          cb();
        }
      });
    },
    function(cb) {
      getAllExternalData(communitiesInfo, function(err, result) {
        if (err) {
          cb(err);
        } else {
          allExternalData = normalizeData.normalizeData(result);
          cb();
        }
      });
    },
    function(cb) {
      getAllCommunityIDs(communitiesInfo, function(err, result) {
        if (err) {
          cb(err);
        } else {
          communityIDs = result;
          cb();
        }
      });
    },
    function(cb) {
      associateDataByCommunity(communityIDs, allExternalData,
          function(err, result) {
        if (err) {
          cb(err);
        } else {
          dataByCommunity = result;
          cb();
        }
      });
    },
    function(cb) {
      insertAllDataIntoDb(dataByCommunity, function() {
        cb();
      });
    }
  ], function(err) {
    if (err) {
      callback(err);
    } else {
      callback();
    }
  });
}

var startTime = new Date().getTime();
populateCommunityData(function() {
  var endTime = new Date().getTime();
  console.log('Time elapsed:', (endTime - startTime) / 1000, 's');
});

module.exports = {
  populateCommunityData: populateCommunityData
};
