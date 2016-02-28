/**
 * Created by Tommy on 2/25/2016.
 */
var Stats = require('fast-stats').Stats;

function normalizePreference(preferenceData) {
  var arr = Object.keys(preferenceData)
      .map(function(key) {return preferenceData[key];});
  var stat = new Stats().push(arr);
  if (!isNaN(stat.gmean()) && !isNaN(stat.gstddev())) {
    var normalArr = arr.map(function(value) {
      return convertToZScore(stat.gmean(), stat.gstddev(), value);
    });
    var i = 0;
    for (var communityID in preferenceData) {
      if (preferenceData.hasOwnProperty(communityID)) {
        preferenceData[communityID] = normalArr[i];
        ++i;
      }
    }
    preferenceData.gmean = stat.gmean();
    preferenceData.gstddev = stat.gstddev();
  }
  return preferenceData;
}

function normalizeData(preferencesData) {
  for (var preference in preferencesData) {
    if (preferencesData.hasOwnProperty(preference)) {
      preferencesData[preference] =
          normalizePreference(preferencesData[preference]);
    }
  }
  return preferencesData;
}

function convertToZScore(gMean, gStdDev, pctOfAvg) {
  return (Math.log(pctOfAvg) - Math.log(gMean)) / Math.log(gStdDev);
}

function convertToPctOfAvg(gMean, gStdDev, zScore) {
  if (gMean && gStdDev) {
    return Math.pow(gStdDev, zScore) * gMean;
  } else {
    return zScore;
  }
}

module.exports = {
  normalizeData: normalizeData,
  convertToPctOfAvg: convertToPctOfAvg
};