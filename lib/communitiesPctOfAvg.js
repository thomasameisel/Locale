/**
 * Created by Tommy on 1/26/2016.
 */
var async = require('async');

function getAllData(communitiesInfo, getExternalData, callback) {
  var communitiesData = [];
  async.eachSeries(communitiesInfo, function(communityInfo, cb) {
    getExternalData(communityInfo, function(err, result) {
      if (err) {
        console.error('Error on communityID ' + communityInfo.communityID +
            ': ' + err);
      } else if (!result) {
        console.error('No result returned for communityID ' +
                      communityInfo.communityID);
      } else {
        var communityData =
            {communityID: communityInfo.communityID, data: result};
        communitiesData.push(communityData);
      }
      // Move to the next iteration, regardless of if there was an error
      cb();
    });
  }, function(err) {
    callback(err, communitiesData);
  });
}

function getAvgData(communitiesData) {
  var sum = 0;
  for (var i = 0; i < communitiesData.length; ++i) {
    sum += communitiesData[i].data;
  }
  return (sum / communitiesData.length);
}

function getPctOfAvg(communitiesData, avgData) {
  var communitiesPctOfAvg = {};
  for (var i = 0; i < communitiesData.length; ++i) {
    var communityID = communitiesData[i].communityID;
    var pctOfAvg = communitiesData[i].data / avgData;
    communitiesPctOfAvg[communityID] = pctOfAvg;
  }
  return communitiesPctOfAvg;
}

function communitiesPctOfAvg(communitiesInfo, getExternalData, callback) {
  getAllData(communitiesInfo, getExternalData, function(err, communitiesData) {
    // This currently can't happen, but putting this here in case we change
    // getAllData in the future.
    if (err) {
      callback(err);
    } else {
      var avgData = getAvgData(communitiesData);
      var communitiesPctOfAvgArr = getPctOfAvg(communitiesData, avgData);
      callback(null, communitiesPctOfAvgArr);
    }
  });
}

module.exports = {
  getAllData: getAllData,
  getAvgData: getAvgData,
  getPctOfAvg: getPctOfAvg,
  communitiesPctOfAvg: communitiesPctOfAvg
};
