// Load modules
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('./community.sql');

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
  var insertStmt = 'INSERT OR REPLACE INTO ' +
      communityDataTable +
      ' VALUES (' +
      communityID +
      ',';
  insertStmt += formatData(fields.crimePctOfAvg);
  insertStmt += ',';
  insertStmt += formatData(fields.nightlifePctOfAvg);
  insertStmt += ',';
  insertStmt += formatData(fields.crowdedPctOfAvg);
  insertStmt += ',';
  insertStmt += formatData(fields.pricePctOfAvg);
  insertStmt += ')';
  db.run(insertStmt);
}

module.exports = {
  getCommunityInfo: getCommunityInfo,
  getAllCommunitiesInfo: getAllCommunitiesInfo,
  insertCommunityData: insertCommunityData
};