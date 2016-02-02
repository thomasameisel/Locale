var request = require('request');
var rankCommunities = require('./communitiesPctOfAvg');

const URL = "http://crime.chicagotribune.com/api/1.0-beta2/";
const SUMMARY_URL = URL + "datesummary";
const COMMUNITY_URL = URL + "communityarea";

// private helper function
function makeRequest(url, params, cb) {
  request({ url:url, qs:params, json:true }, function(error, response, body) {
    if(error) {
      cb(new Error(error));
    } else if(response.statusCode != 200) {
      cb(new Error("Response Code:+response.statusCode"));
    } else {
      cb(null, body);
    }
  });
}

/* returns an object with (in alphabetical order) { adjacent_area_numbers, area_number,
   hardship_index, name, pct_crowded, pct_no_diploma, pct_old_and_young, pct_poverty,
   pct_unemployed, per_capita_icome, population_2000, population_2010, shape_area,
   shape_len, slug, wikipedia } */
function getAllCommunityData(communityNumber, cb) {
  var params = { community_area: communityNumber, limit: 1, related: 1, format: "json" };
  makeRequest(COMMUNITY_URL, params, function(err, response) {
    if(err) {
      cb(err);
    } else {
      var communityData = response.meta.community_area;
      cb(null, communityData);
    }
  });
}

function getCrowdedPct(communityInfo, cb) {
  getAllCommunityData(communityInfo.communityID, function(err, response) {
    if(err) {
      cb(err);
    } else {
      var pctCrowded = response.pct_crowded;
      cb(null, pctCrowded);
    }
  });
}

function communitiesCrowdedPctOfAvg(communitiesInfo, cb) {
  rankCommunities.communitiesPctOfAvg(communitiesInfo, getCrowdedPct, function(err, result) {
    if(err) {
      cb(err);
    } else {
      cb(null, result);
    }
  });
}

function getCrimeCount(communityInfo, cb) {
  // set date to today initially
  var sixMonthsAgo = new Date();
  // then subtract 6 months
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  var dateString = sixMonthsAgo.toJSON();
  var params = { community_area: communityInfo.communityID, limit: 1,
                 crime_date__gte: dateString, include: "total_count",
                 format: 'json' };

  makeRequest(SUMMARY_URL, params, function(err, response) {
    if(err) {
      cb(err);
    } else {
      var numCrimes = response.meta.total_count;
      cb(null, numCrimes);
    }
  })
}

function communitiesCrimePctOfAvg(communitiesInfo, cb) {
  rankCommunities.communitiesPctOfAvg(communitiesInfo, getCrimeCount, function(err, result) {
    if(err) {
      cb(err);
    } else {
      cb(null, result);
    }
  });
}

module.exports = {
  getAllCommunityData: getAllCommunityData,
  getCrowdedPct: getCrowdedPct,
  communitiesCrowdedPctOfAvg: communitiesCrowdedPctOfAvg,
  getCrimeCount: getCrimeCount,
  communitiesCrimePctOfAvg: communitiesCrimePctOfAvg
};
