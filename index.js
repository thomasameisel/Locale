var request = require('request');

const URL = "http://crime.chicagotribune.com/api/1.0-beta2/";
const SUMMARY_URL = URL + "datesummary";
const COMMUNITY_URL = URL + "communityarea";

// NOTE: If RETURN_FORMAT is changed, then json:true must be removed from the request options
const RETURN_FORMAT = "json";

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
  params.format = RETURN_FORMAT;
  makeRequest(SUMMARY_URL, params, cb);
}

function getCommunityData(params, cb) {
  params.format = RETURN_FORMAT;
  makeRequest(COMMUNITY_URL, params, cb);
}

// if communityNumber is null, returns data for all of Chicago
function getYearCrimeCount(communityNumber, year, cb) {
  var params = { limit:1, year: year, include: "total_count" };

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
  getYearCrimeCount: getYearCrimeCount
};
