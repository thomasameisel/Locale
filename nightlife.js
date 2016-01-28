/**
 * Created by Tommy on 1/26/2016.
 */
var Foursquare = require('foursquare-venues');
var async = require('async');
var db = require('./db');

var foursquare = new Foursquare('EGPAR3MMXL0CRMNFBGMU2CIVLQKU4B2MPGKUR05GAJ2WB4D3',
    'EVDZSAYEE5OIZGSWFUZVE5021ZDOPTYHVIUYVIBKP2YBUU0M');
var nightlifeCategoryID = '4d4b7105d754a06376d81259';

var communityIDs = [7,8,24,28,32,33]; //will be 1-77 in the future

function getNumNightlifeVenuesLocInfo(locationInfo,callback) {
    var parameter = {ll:locationInfo.latLng,sw:locationInfo.sw,ne:locationInfo.ne,limit:'50',intent:'browse',
        categoryId:nightlifeCategoryID};
    foursquare.searchVenues(parameter, function(err,response) {
        if(err) callback(err);

        callback(null, response.response.venues.length);
    });
}

function getNightlifePerLandArea(communityID,callback) {
    var locationInfo, numNightlifeVenues;
    async.series([
        function(cb) {
            db.getCommunityInfo(communityID,function(err,result) {
                if(err) callback(err);

                locationInfo=result;
                cb();
            });
        },
        function(cb) {
            getNumNightlifeVenuesLocInfo(locationInfo,function(err,result) {
                if(err) callback(err);

                numNightlifeVenues = result;
                cb();
            });
        }
    ], function(err) {
        if(err) callback(err);

        callback(null, (numNightlifeVenues/locationInfo.landArea));
    });
}

function getAllNightlifeByLandArea(callback) {
    var communitiesNightlifePerLandArea = [];
    async.each(communityIDs, function(communityID, cb) {
        getNightlifePerLandArea(communityID,function(err,result) {
            if(err) callback(err);

            var communityNightlife = {communityID:communityID,nightlifePerLandArea:result}
            communitiesNightlifePerLandArea.push(communityNightlife);
            cb();
        });
    }, function(err) {
        if(err) callback(err);

        callback(null, communitiesNightlifePerLandArea);
    });
}

function getAvgNightlifePerLandArea(communitiesNightlifePerLandArea,callback) {
    var sum = 0;
    for (var i = 0; i < communitiesNightlifePerLandArea.length; ++i) {
        sum+=communitiesNightlifePerLandArea[i].nightlifePerLandArea;
    }
    callback(null, (sum/communitiesNightlifePerLandArea.length));
}

function getRelativeNightlifePerLandArea(communitiesNightlifePerLandArea,avgNightlifePerLandArea,callback) {
    var communitiesRelativeNightlifePerLandArea = [];
    for (var i = 0; i < communitiesNightlifePerLandArea.length; ++i) {
        var communityID = communitiesNightlifePerLandArea[i].communityID;
        var relativeNightlifePerLandArea =
                communitiesNightlifePerLandArea[i].nightlifePerLandArea/avgNightlifePerLandArea;
        var relativeCommunityNightlife =
                {communityID:communityID,relativeNightlifePerLandArea:relativeNightlifePerLandArea};
        communitiesRelativeNightlifePerLandArea.push(relativeCommunityNightlife);
    }
    callback(null, communitiesRelativeNightlifePerLandArea);
}

function compareRelativeNightlifePerLandArea(a,b) {
    if (a.relativeNightlifePerLandArea < b.relativeNightlifePerLandArea) {
        return -1;
    } else if (a.relativeNightlifePerLandArea > b.relativeNightlifePerLandArea) {
        return 1;
    } else {
        return 0;
    }
}

function rankCommunitiesNightlife(callback) {
    var avgNightlifePerLandArea = 0;
    var communitiesNightlifePerLandArea = [];
    var communitiesRelativeNightlifePerLandArea = [];
    async.series([
        function(cb) {
            getAllNightlifeByLandArea(function(err,result) {
                if(err) cb(err);

                communitiesNightlifePerLandArea = result;
                cb();
            })
        },
        function(cb) {
            getAvgNightlifePerLandArea(communitiesNightlifePerLandArea,function(err,result) {
                if(err) cb(err);

                avgNightlifePerLandArea = result;
                cb();
            })
        },
        function(cb) {
            getRelativeNightlifePerLandArea(communitiesNightlifePerLandArea,avgNightlifePerLandArea,
                    function(err,result) {
                        if(err) cb(err);

                        communitiesRelativeNightlifePerLandArea = result;
                        cb();
                    }
            )
        }
    ], function(err) {
        if(err) callback(err);

        communitiesRelativeNightlifePerLandArea.sort(compareRelativeNightlifePerLandArea);
        callback(null, communitiesRelativeNightlifePerLandArea);
    });
}

module.exports = {
    rankCommunitiesNightlife: rankCommunitiesNightlife
}