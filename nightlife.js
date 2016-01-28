/**
 * Created by Tommy on 1/26/2016.
 */
var Foursquare = require('foursquare-venues');
var async = require('async');
var db = require('./db');
var rankCommunities = require('./rankCommunities');

var foursquare = new Foursquare('EGPAR3MMXL0CRMNFBGMU2CIVLQKU4B2MPGKUR05GAJ2WB4D3',
    'EVDZSAYEE5OIZGSWFUZVE5021ZDOPTYHVIUYVIBKP2YBUU0M');
var nightlifeCategoryID = '4d4b7105d754a06376d81259';

function getVenuesPerLandArea(locationInfo,callback) {
    var parameter = {ll:locationInfo.latLng,sw:locationInfo.sw,ne:locationInfo.ne,limit:'50',intent:'browse',
        categoryId:nightlifeCategoryID};
    foursquare.searchVenues(parameter, function(err,response) {
        if(err) callback(err);

        callback(null, (response.response.venues.length/locationInfo.landArea));
    });
}

function rankCommunitiesNightlife(callback) {
    var communitiesInfo = [];
    var communitiesNightlifeRanked = [];
    async.series([
        function(cb) {
            db.getAllCommunitiesInfo(function(err,result) {
                if(err) cb(err);

                communitiesInfo = result;
                cb();
            })
        },
        function(cb) {
            rankCommunities.rankCommunities(communitiesInfo,getVenuesPerLandArea,function(err,result) {
                if(err) cb(err);

                communitiesNightlifeRanked = result;
                cb();
            });
        }
    ],function(err) {
        if(err) callback(err);

        callback(null, communitiesNightlifeRanked);
    });
}

module.exports = {
    rankCommunitiesNightlife: rankCommunitiesNightlife
}