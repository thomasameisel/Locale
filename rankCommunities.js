/**
 * Created by Tommy on 1/26/2016.
 */
var async = require('async');

function getAllData(communitiesInfo,getExternalData,callback) {
    var communitiesData = [];
    async.each(communitiesInfo, function(communityInfo, cb) {
        getExternalData(communityInfo,function(err,result) {
            if(err) cb(err);

            var communityData = {communityID:communityInfo.communityID,data:result};
            communitiesData.push(communityData);
            cb();
        });
    }, function(err) {
        if(err) callback(err);

        callback(null, communitiesData);
    });
}

function getAvgData(communitiesData,callback) {
    var sum = 0;
    for (var i = 0; i < communitiesData.length; ++i) {
        sum+=communitiesData[i].data;
    }
    callback(null, (sum/communitiesData.length));
}

function getPctOfAvg(communitiesData,avgData,callback) {
    var communitiesPctOfAvg = [];
    for (var i = 0; i < communitiesData.length; ++i) {
        var communityID = communitiesData[i].communityID;
        var pctOfAvg = communitiesData[i].data/avgData;
        var communityPctOfAvg = {communityID:communityID,pctOfAvg:pctOfAvg};
        communitiesPctOfAvg.push(communityPctOfAvg);
    }
    callback(null, communitiesPctOfAvg);
}

function rankCommunities(communitiesInfo,getExternalData,callback) {
    var avgData = 0;
    var communitiesData = [];
    var communitiesPctOfAvg = [];
    async.series([
        function(cb) {
            getAllData(communitiesInfo,getExternalData,function(err,result) {
                if(err) cb(err);

                communitiesData = result;
                cb();
            })
        },
        function(cb) {
            getAvgData(communitiesData,function(err,result) {
                if(err) cb(err);

                avgData = result;
                cb();
            })
        },
        function(cb) {
            getPctOfAvg(communitiesData,avgData,
                function(err,result) {
                    if(err) cb(err);

                    communitiesPctOfAvg = result;
                    cb();
                }
            )
        }
    ], function(err) {
        if(err) callback(err);

        callback(null, communitiesPctOfAvg);
    });
}

module.exports = {
    rankCommunities: rankCommunities
}