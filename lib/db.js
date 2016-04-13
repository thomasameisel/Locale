// Load modules
var path = require('path');
var sqlite3 = require('sqlite3').verbose();
// NOTE: using path is required because sqlite3 relative paths don't behave
// as expected
var dbs = {
  CHICAGO: new sqlite3.Database(path.join(__dirname, 'chicago.sqlite')),
  NEWYORK: new sqlite3.Database(path.join(__dirname, 'newyork.sqlite'))
};

var communityAreaTable = 'CommunityArea';
var communityDataTable = 'CommunityData';
var communityDirectionsTable = 'CommunityDirections';
var preferencesStatisticsTable = 'PreferencesStatistics';

function getCommunityInfo(city, communityID, callback) {
  var selectStmt = 'SELECT * FROM ' + communityAreaTable +
      ' WHERE communityID=$communityID';
  var params = {
    $communityID: communityID
  };
  dbs[city].all(selectStmt, params, function(err, rows) {
    var result;
    if (rows.length === 1) {
      result = rows[0];
    }
    callback(err, result);
  });
}

function getAllCommunitiesInfo(city, callback) {
  var selectStmt = 'SELECT * FROM ' + communityAreaTable;
  dbs[city].all(selectStmt, function(err, rows) {
    callback(err, rows);
  });
}

function formatString(str) {
  if (str && str !== null) {
    return str;
  } else {
    return 'NULL';
  }
}

function formatNumber(num) {
  if (num && num !== null && !isNaN(num)) {
    return num;
  } else {
    return 'NULL';
  }
}

function insertCommunityData(city, communityID, fields, table) {
  var insertStmt;
  var keyName = (table === communityDataTable) ? 'communityID' : 'statistic';
  switch (city) {
    case 'CHICAGO': {
      insertStmt = 'INSERT OR REPLACE INTO ' + table + ' (' +
        keyName + ', violentCrimePctOfAvg, nonViolentCrimePctOfAvg, ' +
        'nightlifePctOfAvg, crowdedPctOfAvg, pricePctOfAvg) ' +
        'VALUES' + '($ID, $violentCrime, $nonViolentCrime, $nightlife, ' +
        '$crowded, $price)';
      break;
    }
    case 'NEWYORK': {
      insertStmt = 'INSERT OR REPLACE INTO ' + table + ' (' +
        keyName + ', violentCrimePctOfAvg, nonViolentCrimePctOfAvg, ' +
        'nightlifePctOfAvg, pricePctOfAvg) ' +
        'VALUES' + '($ID, $violentCrime, $nonViolentCrime, $nightlife, ' +
        '$price)';
      break;
    }
  }
  var params = {
    $ID: communityID,
    $violentCrime: formatNumber(fields.violentCrimePctOfAvg),
    $nonViolentCrime: formatNumber(fields.nonViolentCrimePctOfAvg),
    $nightlife: formatNumber(fields.nightlifePctOfAvg),
    $crowded: formatNumber(fields.crowdedPctOfAvg),
    $price: formatNumber(fields.pricePctOfAvg)
  };
  dbs[city].run(insertStmt, params);
}

function updateCommunityData(city, communityID, fields, table) {
  var updateStmt = 'UPDATE ' + table + ' SET ' +
    'violentCrimePctOfAvg=$violentCrime, ' +
    'nonViolentCrimePctOfAvg=$nonViolentCrime, ' +
    'crowdedPctOfAvg=$crowded, pricePctOfAvg=$price ' +
    'WHERE communityID=' + communityID;
  var params = {
    $violentCrime: formatNumber(fields.violentCrimePctOfAvg),
    $nonViolentCrime: formatNumber(fields.nonViolentCrimePctOfAvg),
    $crowded: formatNumber(fields.crowdedPctOfAvg),
    $price: formatNumber(fields.pricePctOfAvg)
  };
  dbs[city].run(insertStmt, params);
}

function insertNYCCrime(communities) {
  bulkInsert('NEWYORK', communities, function(name, communityInfo) {
    var insertStmt = 'INSERT OR REPLACE INTO Crime VALUES' +
        '($name,$crime)';
    var params = {
      $name: name,
      $crime: communityInfo.crimes
    };
    dbs.NEWYORK.run(insertStmt, params);
  });
}

function insertAllCommunitiesData(city, dataByCommunity) {
  bulkInsert(city, dataByCommunity, function(communityID, communityInfo) {
    var table;
    if (communityID === 'gmean' || communityID === 'gstddev') {
      table = preferencesStatisticsTable;
    } else {
      table = communityDataTable;
    }
    insertCommunityData(city, communityID, communityInfo, table);
  });
}

function getCommunitiesCondition(city, condition, callback) {
  dbs[city].all('SELECT * FROM ' +
      communityAreaTable + ' natural join ' + communityDataTable +
      ' WHERE ' + condition,
      function(err, rows) {
    callback(err, rows);
  });
}

function getPreferencesStatistics(city, callback) {
  dbs[city].all('SELECT * FROM ' + preferencesStatisticsTable,
      function(err, rows) {
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

/* fields array should have length 78
 *  the 77 community directions should start at index 1
 *  to reflect that the community IDs start at 1
 */
function insertDirectionsData(city, latLng, fields) {
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
    insertStmt += formatNumber(fields[i]);
    if (i < (fields.length - 1)) {
      insertStmt += ',';
    }
  }
  insertStmt += ')';
  dbs[city].run(insertStmt, params);
}

function insertAllDirectionsData(city, dataByLatLng) {
  bulkInsert(city, dataByLatLng, function(latLng, data) {
    insertDirectionsData(city, latLng, data);
  });
}

function getAllDirectionsData(city, callback) {
  var selectStmt = 'SELECT * FROM ' + communityDirectionsTable;
  dbs[city].all(selectStmt, callback);
}

function getClosestLatLng(city, latLng, callback) {
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
  dbs[city].all(selectStmt, function(err, rows) {
    callback(err, rows[0]);
  });
}

function insertCommunityArea(city, communityID, communityInfo) {
  var insertStmt;
  var params;
  if (city === 'CHICAGO') {
    insertStmt = 'INSERT OR REPLACE INTO ' + communityAreaTable +
      ' VALUES ($ID,$name,$landArea,$center,$truliaID,$radius,$outline)';
    params = {
      $ID: communityID,
      $name: formatString(communityInfo.name),
      $landArea: formatNumber(communityInfo.landArea),
      $center: formatString(communityInfo.center),
      $radius: formatNumber(communityInfo.radius),
      $outline: formatString(JSON.stringify(communityInfo.outline)),
      $truliaID: formatNumber(communityInfo.truliaID)
    };
  } else if (city === 'NEWYORK') {
    insertStmt = 'INSERT OR REPLACE INTO ' + communityAreaTable +
      ' VALUES ($name,$name,$borough,$landArea,$center,$streetEasyID,$radius,' +
      '$outline)';
    params = {
      $name: formatString(communityID),
      $borough: formatString(communityInfo.borough),
      $landArea: formatNumber(communityInfo.landArea),
      $center: formatString(communityInfo.center),
      $streetEasyID: formatString(communityInfo.streetEasyID),
      $radius: formatNumber(communityInfo.radius),
      $outline: formatString(JSON.stringify(communityInfo.outline))
    };
  }
  dbs[city].run(insertStmt, params);
}

function insertAllCommunityAreas(city, communities) {
  bulkInsert(city, communities, function(communityID, communityInfo) {
    insertCommunityArea(city, communityID, communityInfo);
  });
}

function bulkInsert(city, obj, insertFunc) {
  dbs[city].serialize(function() {
    dbs[city].exec('BEGIN');
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        insertFunc(key, obj[key]);
      }
    }
    dbs[city].exec('COMMIT');
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
  getAllDirectionsData: getAllDirectionsData,
  insertCommunityArea: insertCommunityArea,
  insertAllCommunityAreas: insertAllCommunityAreas,
  getClosestLatLng: getClosestLatLng,
  getCommunitiesCondition: getCommunitiesCondition,
  insertNYCCrime: insertNYCCrime
};
