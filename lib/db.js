// Load modules
var path = require('path');
var sqlite3 = require('sqlite3').verbose();
// NOTE: using path is required because sqlite3 relative paths don't behave
// as expected
var db = new sqlite3.Database(path.join(__dirname, 'community.sqlite'));

var communityAreaTable = 'CommunityArea';
var communityDataTable = 'CommunityData';
var communityDirectionsTable = 'CommunityDirections';
var preferencesStatisticsTable = 'PreferencesStatistics';

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

function insertCommunityData(communityID, fields, table) {
  var insertStmt = 'INSERT OR REPLACE INTO ' + table + ' VALUES' +
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
      if (dataByCommunity.hasOwnProperty(communityID)) {
        var table;
        if (isNaN(communityID)) {
          table = preferencesStatisticsTable;
        } else {
          table = communityDataTable;
        }
        insertCommunityData(communityID, dataByCommunity[communityID], table);
      }
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

function getPreferencesStatistics(callback) {
  db.all('SELECT * FROM ' + preferencesStatisticsTable, function(err, rows) {
    var statistics = {};
    var statisticTypes = [];
    for (var i = 0; i < rows.length; ++i) {
      statisticTypes.push(rows[i].statistic);
      delete rows[i].statistic;
      statistics[statisticTypes[i]] = rows[i];
    }
    callback(err, statistics);
  });
}

function insertDirectionsData(latLng, fields) {
  var latLngArr = latLng.split(',');
  var lat = parseFloat(latLngArr[0]);
  var lng = parseFloat(latLngArr[1]);
  var latRad = lat * Math.PI / 180;
  var lngRad = lng * Math.PI / 180;
  var insertStmt = 'INSERT OR REPLACE INTO ' + communityDirectionsTable +
    ' VALUES($lat,$lng,$sinLat,$cosLat,$sinLng,$cosLng,';
  var params = {
    $lat: lat,
    $lng: lng,
    $sinLat: Math.sin(latRad),
    $cosLat: Math.cos(latRad),
    $sinLng: Math.sin(lngRad),
    $cosLng: Math.cos(lngRad)
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

function getClosestLatLng(latLng, callback) {
  var latRad = latLng.lat * Math.PI / 180;
  var lngRad = latLng.lng * Math.PI / 180;
  var selectStmt = 'SELECT *,' +
      '(sinLat * ' + Math.sin(latRad) + ' + ' +
      'cosLat * ' + Math.cos(latRad) + ' + (' +
      'sinLng * ' + Math.sin(lngRad) + ' + ' +
      'cosLng * ' + Math.cos(lngRad) + ')) AS distance ' +
      'FROM ' + communityDirectionsTable + ' ' +
      'ORDER BY distance DESC ' +
      'LIMIT 1';
  db.all(selectStmt, function(err, rows) {
    callback(err, rows[0]);
  });
}

/*var createStmt = 'CREATE TABLE CommunityDirections2' +
'(lat REAL NOT NULL,lng REAL NOT NULL,sinLat REAL NOT NULL,' +
'cosLat REAL NOT NULL,sinLng REAL NOT NULL,cosLng REAL NOT NULL,';
for (var i = 1; i <= 77; ++i) {
  createStmt += ('\'' + i.toString() + '\'' + ' REAL');
  if (i <= 76) {
    createStmt += ',';
  }
}
createStmt += ',PRIMARY KEY(lat,lng))';
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
  getPreferencesStatistics: getPreferencesStatistics,
  insertCommunityData: insertCommunityData,
  insertAllCommunitiesData: insertAllCommunitiesData,
  insertDirectionsData: insertDirectionsData,
  insertAllDirectionsData: insertAllDirectionsData,
  getClosestLatLng: getClosestLatLng,
  getCommunitiesCondition: getCommunitiesCondition
};
