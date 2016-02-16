// Load modules
var path = require('path');
var sqlite3 = require('sqlite3').verbose();
// NOTE: using path is required because sqlite3 relative paths don't behave
// as expected
var db = new sqlite3.Database(path.join(__dirname, 'community.sqlite'));

var communityAreaTable = 'CommunityArea';
var communityDataTable = 'CommunityData';
var communityDirectionsTable = 'CommunityDirections';

function getCommunityInfo(communityID, callback) {
  var selectStmt = 'SELECT * FROM ' + communityAreaTable +
      ' WHERE communityID=$communityID';
  var params = {
    $communityID: communityID
  };
  db.all(selectStmt, params, function(err, rows) {
    callback(err, rows[0]);
  });
}

function getAllCommunitiesInfo(callback) {
  var selectStmt = 'SELECT * FROM ' + communityAreaTable;
  db.all(selectStmt, function(err, rows) {
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
  var insertStmt = 'INSERT OR REPLACE INTO ' + communityDataTable + ' VALUES' +
   '($ID, $violentCrime, $nonViolentCrime, $nightlife, $crowded, $price)';
  var params = {
    $ID: communityID,
    $violentCrime: formatData(fields.violentCrimePctOfAvg),
    $nonViolentCrime: formatData(fields.nonViolentCrimePctOfAvg),
    $nightlife: formatData(fields.nightlifePctOfAvg),
    $crowded: formatData(fields.crowdedPctOfAvg),
    $price: formatData(fields.pricePctOfAvg)
  };
  db.run(insertStmt, params);
}

function insertAllCommunitiesData(dataByCommunity) {
  db.serialize(function() {
    db.exec('BEGIN');
    for (var communityID in dataByCommunity) {
      insertCommunityData(communityID, dataByCommunity[communityID]);
    }
    db.exec('COMMIT');
  });
}

function getCommunitiesCondition(condition, callback) {
  db.all('SELECT * FROM ' +
          communityAreaTable + ' natural join ' + communityDataTable +
          ' WHERE ' + condition,
          function(err, rows) {
    callback(err, rows);
  });
}

function insertDirectionsData(latLng, fields) {
  var insertStmt = 'INSERT OR REPLACE INTO ' + communityDirectionsTable +
    ' VALUES($lat,$lng,';
  var params = {
    $lat: latLng.split(',')[0],
    $lng: latLng.split(',')[1]
  };
  for (var i = 1; i < fields.length; ++i) {
    insertStmt += formatData(fields[i]);
    if (i < (fields.length - 1)) {
      insertStmt += ',';
    }
  }
  insertStmt += ')';
  db.run(insertStmt, params);
}

function insertAllDirectionsData(dataByLatLng) {
  db.serialize(function() {
    db.exec('BEGIN');
    for (var latLng in dataByLatLng) {
      insertDirectionsData(latLng, dataByLatLng[latLng]);
    }
    db.exec('COMMIT');
  });
}

/*var createStmt = 'CREATE TABLE CommunityDirections
(lat REAL NOT NULL,lng REAL NOT NULL,';
for (var i = 1; i <= 77; ++i) {
  createStmt += ('\'' + i.toString() + '\'' + ' REAL');
  if (i <= 76) {
    createStmt += ',';
  }
}
createStmt += ',PRIMARY KEY(lat, lng))';
db.run(createStmt);*/
/*for (var i = 100; i < 1000; ++i) {
  var insertStmt = 'INSERT INTO CommunityDirections VALUES(' + i + ',';
  for (var j = 0; j < 77; ++j) {
    insertStmt += '30.789234';
    if (j < 76) {
      insertStmt += ',';
    }
  }
  insertStmt += ')';
  db.run(insertStmt);
}*/
/*var selectStmt = 'SELECT * FROM CommunityDirections WHERE latLng=6';
db.all(selectStmt, function(err, rows) {
  console.log(rows);
});*/

module.exports = {
  getCommunityInfo: getCommunityInfo,
  getAllCommunitiesInfo: getAllCommunitiesInfo,
  insertCommunityData: insertCommunityData,
  insertAllCommunitiesData: insertAllCommunitiesData,
  insertDirectionsData: insertDirectionsData,
  insertAllDirectionsData: insertAllDirectionsData,
  getCommunitiesCondition: getCommunitiesCondition
};
