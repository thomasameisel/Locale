/**
 * Created by Tommy on 1/26/2016.
 */
var Foursquare = require('foursquare-venues');
var async = require('async');
var communitiesPctOfAvg = require('./communitiesPctOfAvg');

var foursquare =
    new Foursquare('EGPAR3MMXL0CRMNFBGMU2CIVLQKU4B2MPGKUR05GAJ2WB4D3',
    'EVDZSAYEE5OIZGSWFUZVE5021ZDOPTYHVIUYVIBKP2YBUU0M');
var nightlifeCategoryID = '4d4b7105d754a06376d81259';

function getVenuesPerLandArea(communityInfo, callback) {
  var parameter = {
    ll: communityInfo.latLn,
    sw: communityInfo.sw,
    ne: communityInfo.ne,
    limit: '50',
    intent: 'browse',
    categoryId: nightlifeCategoryID
  };
  foursquare.searchVenues(parameter, function(err, response) {
    if (err) {
      callback(err);
    } else {
      callback(null,
          (response.response.venues.length / communityInfo.landArea));
    }
  });
}

function communitiesNightlifePctOfAvg(communitiesInfo, callback) {
  communitiesPctOfAvg.communitiesPctOfAvg(communitiesInfo,
      getVenuesPerLandArea,
      function(err, result) {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
}

module.exports = {
  communitiesNightlifePctOfAvg: communitiesNightlifePctOfAvg
};