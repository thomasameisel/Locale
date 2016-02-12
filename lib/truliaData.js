/**
 * Created by Tommy on 2/4/2016.
 */
var request = require('request');
var RateLimiter = require('limiter').RateLimiter;
var parseString = require('xml2js').parseString;
var communitiesPctOfAvg = require('./communitiesPctOfAvg');

var limiter = new RateLimiter(1, 500);

var apikey = 'ygnw4985bmtdxz9fmhn84yyg';
var URL = 'http://api.trulia.com/webservices.php';
var truliaLibrary = 'TruliaStats';

// Private helper function
function makeRequest(url, params, cb) {
  request({url: url, qs: params, json: true}, function(error, response, body) {
    if (error) {
      cb(new Error(error));
    } else if (response.statusCode != 200) {
      cb(new Error('Response Code:' + response.statusCode));
    } else {
      cb(null, body);
    }
  });
}

function generateParams(communityInfo) {
  var today = new Date();
  var sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  sixMonthsAgo.toDateString();
  var todayString = today.toISOString().split('T')[0];
  var sixMonthsAgoString = sixMonthsAgo.toISOString().split('T')[0];
  var params = {
    library: truliaLibrary,
    startDate: sixMonthsAgoString,
    endDate: todayString,
    statType: 'listings',
    neighborhoodId: communityInfo.truliaID,
    function: 'getNeighborhoodStats',
    apikey: apikey
  };
  return params;
}

function getAveragePriceFromArr(result, callback) {
  parseString(result, function(err, result) {
    if (err) {
      callback(err);
    } else {
      var listings = result.TruliaWebServices
          .response[0].TruliaStats[0].listingStats[0].listingStat;
      var oneBedroomSum = 0;
      if (listings) {
        for (var i = 0; i < listings.length; ++i) {
          oneBedroomSum += parseInt(listings[i].listingPrice[0]
              .subcategory[1].medianListingPrice[0]);
        }
        callback(null, (oneBedroomSum / listings.length));
      } else {
        callback();
      }
    }
  });
}

function getCommunityPrice(communityInfo, callback) {
  limiter.removeTokens(1, function(err, remainingCalls) {
    var params = generateParams(communityInfo);

    makeRequest(URL, params, function(err, result) {
      if (err) {
        callback(err);
      } else {
        getAveragePriceFromArr(result, callback);
      }
    });
  });
}

function communitiesPricePctOfAvg(communitiesInfo, callback) {
  communitiesPctOfAvg.communitiesPctOfAvg(communitiesInfo,
      getCommunityPrice,
      function(err, result) {
    if (err) {
      callback(err);
    } else {
      callback(null, result);
    }
  });
}

module.exports = {
  communitiesPricePctOfAvg: communitiesPricePctOfAvg
};