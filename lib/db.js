// Load modules
var path = require('path');
var sqlite3 = require('sqlite3').verbose();
// NOTE: using path is required because sqlite3 relative paths don't behave
// as expected
var db = new sqlite3.Database(path.join(__dirname, 'community.sqlite'));

var communityAreaTable = 'CommunityArea';
var communityDataTable = 'CommunityData';

function getCommunityInfo(communityID, callback) {
  db.all('SELECT * from ' +
      communityAreaTable +
      ' where communityID=' +
      communityID, function(err, rows) {
    callback(err, rows[0]);
  });
}

function getAllCommunitiesInfo(callback) {
  db.all('SELECT * from ' +
      communityAreaTable,
      function(err, rows) {
    callback(err, rows);
  });
}

function formatData(data) {
  if (data && !isNaN(data)) {
    return data;
  } else {
    return 'NULL';
  }
}

function insertCommunityData(communityID, fields) {
  var insertStmt = 'INSERT OR REPLACE INTO $table VALUES $ID, $violentCrime,' +
                   '$nonViolentCrime, $nightlife, $crowded, $price)';
  var params = {
    $table: communityDataTable,
    $ID: communityID,
    $violentCrime: formatData(fields.violentCrimePctOfAvg),
    $nonViolentCrime: formatData(fields.nonViolentCrimePctOfAvg),
    $nightlife: formatData(fields.nightlifePctOfAvg),
    $crowded: formatData(fields.crowdedPctOfAvg),
    $price: formatData(fields.pricePctOfAvg)
  };
  db.run(insertStmt, params);
}

function getCommunitiesCondition(condition, callback) {
  db.all('SELECT * from ' +
      communityAreaTable + ' natural join ' + communityDataTable +
      ' where ' + condition,
      function(err, rows) {
    callback(err, rows);
  });
}

module.exports = {
  getCommunityInfo: getCommunityInfo,
  getAllCommunitiesInfo: getAllCommunitiesInfo,
  insertCommunityData: insertCommunityData,
  getCommunitiesCondition: getCommunitiesCondition
};
