var request = require('request');
var async = require('async');
var commPctOfAvg = require('./communitiesPctOfAvg');

const URL = 'http://crime.chicagotribune.com/api/1.0-beta2/';
const SUMMARY_URL = URL + 'datesummary';
const COMMUNITY_URL = URL + 'communityarea';

// Private helper function
function makeRequest(url, params, cb) {
  request({ url: url, qs: params, json: true },
            function(error, response, body) {
    if (error) {
      cb(new Error(error));
    } else if (response.statusCode != 200) {
      cb(new Error('Response Code:' + response.statusCode));
    } else {
      cb(null, body);
    }
  });
}

/* Returns an object with (in alphabetical order) { adjacent_area_numbers,
   area_number, hardship_index, name, pct_crowded, pct_no_diploma,
   pct_old_and_young, pct_poverty, pct_unemployed, per_capita_icome,
   population_2000, population_2010, shape_area, shape_len, slug, wikipedia } */
function getAllCommunityData(communityNumber, cb) {
  var params = { community_area: communityNumber, limit: 1, related: 1,
                 format: 'json' };
  makeRequest(COMMUNITY_URL, params, function(err, response) {
    if (err) {
      cb(err);
    } else {
      var communityData = response.meta.community_area;
      cb(null, communityData);
    }
  });
}

function getCrowdedPct(communityInfo, cb) {
  getAllCommunityData(communityInfo.communityID, function(err, response) {
    if (err) {
      cb(err);
    } else {
      var pctCrowded = Number(response.pct_crowded);
      cb(null, pctCrowded);
    }
  });
}

function communitiesCrowdedPctOfAvg(communitiesInfo, cb) {
  commPctOfAvg.communitiesPctOfAvg(communitiesInfo, getCrowdedPct,
                                      function(err, result) {
    if (err) {
      cb(err);
    } else {
      cb(null, result);
    }
  });
}

function getCrimeCount(communityInfo, cb) {
  // Set date to today initially
  var sixMonthsAgo = new Date();
  // Then subtract 6 months
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  var dateString = sixMonthsAgo.toJSON();
  var params = { community_area: communityInfo.communityID, limit: 0,
                 crime_date__gte: dateString, format: 'json' };

  makeRequest(SUMMARY_URL, params, function(err, response) {
    if (err) {
      cb(err);
    } else {
      var dailyCrimeObjects = response.objects;
      // Sanity check here because it's too cumbersome to write a test for this
      if (dailyCrimeObjects.length !== response.meta.total_count) {
        console.error('Warning: the number of responses retrieved does not ' +
                      'equal the total_count parameter.');
      }
      var violentCrimes = 0;
      var nonViolentCrimes = 0;
      dailyCrimeObjects.forEach(function(curObject) {
        // Add up the total number of crimes reported each day
        violentCrimes += curObject.total_violent;
        nonViolentCrimes += (curObject.total_property +
                             curObject.total_quality_of_life);
      });
      var returnObject = {
        violent: (violentCrimes / communityInfo.landArea),
        nonViolent: (nonViolentCrimes / communityInfo.landArea)
      };
      cb(null, returnObject);
    }
  });
}

// NOTE: This function replicates some of the functionality in
// commPctOfAvg.communitiesPctOfAvg. Because violent and non-violent crime
// stats are returned from a single call, it was necessary to handle it
// differently.
function communitiesCrimePctOfAvg(communitiesInfo, cb) {
  var violentCrime = [];
  var nonViolentCrime = [];
  var avgViolent = 0;
  var avgNonViolent = 0;
  var violentPctOfAvg = [];
  var nonViolentPctOfAvg = [];
  async.series([
    function(nextAsync) {
      async.each(communitiesInfo, function(communityInfo, nextItr) {
        getCrimeCount(communityInfo, function(err, result) {
          if (err || !result) {
            nextItr(err);
          } else {
            var violentObj = { communityID: communityInfo.communityID,
                               data: result.violent };
            var nonViolentObj = { communityID: communityInfo.communityID,
                                  data: result.nonViolent };
            violentCrime.push(violentObj);
            nonViolentCrime.push(nonViolentObj);
            nextItr();
          }
        });
      }, function(err) {
        if (err) {
          nextAsync(err);
        } else {
          nextAsync();
        }
      });
    },
    function(nextAsync) {
      commPctOfAvg.getAvgData(violentCrime, function(err, result) {
        if (err) {
          nextAsync(err);
        } else {
          avgViolent = result;
          nextAsync();
        }
      });
    },
    function(nextAsync) {
      commPctOfAvg.getAvgData(nonViolentCrime, function(err, result) {
        if (err) {
          nextAsync(err);
        } else {
          avgNonViolent = result;
          nextAsync();
        }
      });
    },
    function(nextAsync) {
      commPctOfAvg.getPctOfAvg(violentCrime, avgViolent, function(err, result) {
        if (err) {
          nextAsync(err);
        } else {
          violentPctOfAvg = result;
          nextAsync();
        }
      });
    },
    function(nextAsync) {
      commPctOfAvg.getPctOfAvg(nonViolentCrime, avgNonViolent,
                               function(err, result) {
        if (err) {
          nextAsync(err);
        } else {
          nonViolentPctOfAvg = result;
          nextAsync();
        }
      });
    },
  ], function(err) {
    cb(err, violentPctOfAvg, nonViolentPctOfAvg);
  });
}

module.exports = {
  getAllCommunityData: getAllCommunityData,
  getCrowdedPct: getCrowdedPct,
  communitiesCrowdedPctOfAvg: communitiesCrowdedPctOfAvg,
  getCrimeCount: getCrimeCount,
  communitiesCrimePctOfAvg: communitiesCrimePctOfAvg
};
