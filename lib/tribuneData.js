var request = require('request');

const URL = "http://crime.chicagotribune.com/api/1.0-beta2/";
const SUMMARY_URL = URL + "datesummary";
const COMMUNITY_URL = URL + "communityarea";

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

function getCrimeData(params, cb) {
  params.format = "json";
  makeRequest(SUMMARY_URL, params, cb);
}

/* returns an object with (in alphabetical order) { adjacent_area_numbers, area_number,
   hardship_index, name, pct_crowded, pct_no_diploma, pct_old_and_young, pct_poverty,
   pct_unemployed, per_capita_icome, population_2000, population_2010, shape_area,
   shape_len, slug, wikipedia } */
function getCommunityData(communityNumber, cb) {
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

// if communityNumber is null, returns data for all of Chicago
function getYearCrimeCount(communityNumber, year, cb) {
  var params = { limit: 1, year: year, include: "total_count" };

  // only add community_area if communityNumber is passed in
  if(communityNumber !== null && typeof communityNumber !== 'undefined') {
    params.community_area = communityNumber;
  }
  getCrimeData(params, function(err, response) {
    if(err) {
      cb(err);
    } else {
      var numCrimes = response.meta.total_count;
      cb(null, numCrimes);
    }
  })
}

module.exports = {
  getYearCrimeCount: getYearCrimeCount,
  getCommunityData: getCommunityData
};
