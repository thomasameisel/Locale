var async = require('async');
var commPctOfAvg = require('./communitiesPctOfAvg');
var makeRequest = require('./makeRequest');

const URL = 'http://crime.chicagotribune.com/api/1.0-beta2/';
const SUMMARY_URL = URL + 'datesummary';
const COMMUNITY_URL = URL + 'communityarea';

/* Returns an object with (in alphabetical order) { adjacent_area_numbers,
   area_number, hardship_index, name, pct_crowded, pct_no_diploma,
   pct_old_and_young, pct_poverty, pct_unemployed, per_capita_icome,
   population_2000, population_2010, shape_area, shape_len, slug, wikipedia } */
function getAllCommunityData(communityNumber, cb) {
  var params = { community_area: communityNumber, limit: 1, related: 1,
                 format: 'json' };
  makeRequest(COMMUNITY_URL, params, function(err, response) {
    if (err) {
      return cb(err);
    } else {
      var communityData = response.meta.community_area;
      return cb(null, communityData);
    }
  });
}

function getCrowdedPct(communityInfo, cb) {
  getAllCommunityData(communityInfo.communityID, function(err, response) {
    if (err) {
      return cb(err);
    } else {
      var pctCrowded = Number(response.pct_crowded);
      return cb(null, pctCrowded);
    }
  });
}

function communitiesCrowdedPctOfAvg(communitiesInfo, cb) {
  commPctOfAvg.communitiesPctOfAvg(communitiesInfo, getCrowdedPct,
                                      function(err, result) {
    return cb(err, result);
  });
}

function getCrimeCount(communityInfo, cb) {
  // Set date to today initially
  var sixMonthsAgo = new Date();
  // Then subtract 6 months
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  var dateString = sixMonthsAgo.toJSON().split('T')[0];
  var params = { community_area: communityInfo.communityID, limit: 0,
                 crime_date__gte: dateString, format: 'json' };

  makeRequest(SUMMARY_URL, params, function(err, response) {
    if (err) {
      return cb(err);
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
      return cb(null, returnObject);
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
  async.each(communitiesInfo, function(communityInfo, nextItr) {
    getCrimeCount(communityInfo, function(err, result) {
      if (err || !result) {
        return nextItr(err);
      } else {
        var violentObj = { communityID: communityInfo.communityID,
                           data: result.violent };
        var nonViolentObj = { communityID: communityInfo.communityID,
                              data: result.nonViolent };
        violentCrime.push(violentObj);
        nonViolentCrime.push(nonViolentObj);
        return nextItr();
      }
    });
  }, function(err) {
    if (err) {
      return cb(err);
    } else {
      var avgViolent = commPctOfAvg.getAvgData(violentCrime);
      var avgNonViolent = commPctOfAvg.getAvgData(nonViolentCrime);
      var violentPctOfAvg = commPctOfAvg.getPctOfAvg(violentCrime, avgViolent);
      var nonViolentPctOfAvg = commPctOfAvg.getPctOfAvg(nonViolentCrime,
                                                        avgNonViolent);
      return cb(null, violentPctOfAvg, nonViolentPctOfAvg);
    }
  });
}

module.exports = {
  getAllCommunityData: getAllCommunityData,
  communitiesCrowdedPctOfAvg: communitiesCrowdedPctOfAvg,
  communitiesCrimePctOfAvg: communitiesCrimePctOfAvg
};
