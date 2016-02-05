/**
 * Created by Tommy on 2/3/2016.
 */
var async = require('async');
var db = require('./db');
var nightlife = require('./nightlife');
var tribuneData = require('./tribuneData');

function getAllExternalData(communitiesInfo, callback) {
    var allExternalData = {};
    async.series([
        function(cb) {
            nightlife.communitiesNightlifePctOfAvg(communitiesInfo, function(err, result) {
                if (err) {
                    cb(err);
                } else {
                    allExternalData.nightlifePctOfAvg = result;
                    cb();
                }
            });
        },
        function(cb) {
            tribuneData.communitiesCrimePctOfAvg(communitiesInfo, function(err, result) {
                if (err) {
                    cb(err);
                } else {
                    allExternalData.crimePctOfAvg = result;
                    cb();
                }
            });
        },
        function(cb) {
            tribuneData.communitiesCrowdedPctOfAvg(communitiesInfo, function(err, result) {
                if (err) {
                    cb(err);
                } else {
                    allExternalData.crowdedPctOfAvg = result;
                    cb();
                }
            });
        }
    ], function(err) {
        callback(err, allExternalData);
    });
}

function associateDataByCommunity(communityIDs, allExternalData, callback) {
    var dataByCommunity = {};
    async.each(communityIDs, function(communityID, cb) {
        var communityData = {};
        for (var dataType in allExternalData) {
            communityData[dataType] = allExternalData[dataType][communityID];
        }
        dataByCommunity[communityID] = communityData;
        cb();
    }, function() {
        callback(dataByCommunity);
    });
}

function insertAllDataIntoDb(dataByCommunity, callback) {
    for (var communityID in dataByCommunity) {
        db.insertCommunityData(communityID, dataByCommunity[communityID]);
    }
    callback();
}

function populateCommunityData() {
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
                    console.log(err);
                }

                allExternalData = result;
                cb();
            });
        },
        function(cb) {
            db.getAllCommunityIDs(function(err, rows) {
                if (err) {
                    cb(err);
                } else {
                    communityIDs = rows;
                    cb();
                }
            });
        },
        function(cb) {
            associateDataByCommunity(communityIDs, allExternalData, function(result) {
                dataByCommunity = result;
                cb();
            });
        },
        function(cb) {
            insertAllDataIntoDb(dataByCommunity, function() {
                cb();
            });
        }
    ], function(err) {
        if (err) {
            console.log(err);
        }
    });
}

module.exports = {
    populateCommunityData: populateCommunityData
}