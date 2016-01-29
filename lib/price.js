/**
 * Created by Tommy on 1/28/2016.
 */
var Zillow = require('node-zillow');
var async = require('async');
var rankCommunities = require('./communitiesPctOfAvg');
var db = require('./db');

var zillow = new Zillow('X1-ZWz19vi2w52gi3_282ek');

var priceDataID = [];

function findName(val,arr) {
    for (var i = 0; i < arr.length; ++i) {
        if(arr[i].name[0] === val) return arr[i];
    }
    return undefined;
}

function getZillowName(name) {
    if (name === "Near South Side") {
        return "South Loop";
    } else if (name === "Loop") {
        return "The Loop";
    } else if (name === "Near North Side") {
        return "Near North";
    } else {
        return name;
    }
}

function getCommunitiesPrice(callback) {
    var parameters = {state:'IL',city:'Chicago',childtype:'neighborhood'};
    zillow.callApi('GetRegionChildren', parameters)
        .then(function(data) {
            var zillowData = data.response[0].list[0].region;
            callback(null, zillowData);
        });
}

function associateZillowDataWithID(communitiesInfo,zillowData,callback) {
    var communitiesPrice = [];
    async.each(communitiesInfo,function(communityInfo,cb) {
        var name = getZillowName(communityInfo.name);
        var zillow = findName(name,zillowData);
        if (zillow) {
            communitiesPrice[communityInfo.communityID] = parseInt(zillow.zindex[0]._);
        }
        cb();
    },function(err) {
        if(err) {
            return callback(err);
        } else {
            return callback(null, communitiesPrice);
        }
    });
}

function getCommunityPrice(communityInfo,callback) {
    if(!priceDataID[communityInfo.communityID]) {
        callback(communityInfo.communityID+" not found");
    } else {
        callback(null, priceDataID[communityInfo.communityID]);
    }
}

function communitiesPricePctOfAvg(communitiesInfo,callback) {
    var zillowData = [];
    var pricePctOfAvg = [];
    async.series([
        function(cb) {
            getCommunitiesPrice(function(err, result) {
                if(err) {
                    cb(err);
                } else {
                    zillowData = result;
                    cb();
                }
            });
        },
        function(cb) {
            associateZillowDataWithID(communitiesInfo,zillowData,function(err, result) {
                if(err) {
                    cb(err);
                } else {
                    priceDataID = result;
                    cb();
                }
            });
        },
        function(cb) {
            rankCommunities.communitiesPctOfAvg(communitiesInfo,getCommunityPrice,function(err,result) {
                if(err) {
                    cb(err);
                } else {
                    pricePctOfAvg = result;
                    cb();
                }
            });
        }
    ],function(err) {
        if(err) {
            return callback(err);
        } else {
            return callback(null, pricePctOfAvg);
        }
    });
}

module.exports = {
    communitiesPricePctOfAvg: communitiesPricePctOfAvg
}