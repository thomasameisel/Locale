var db = require('./db');
var fs = require('fs');

var allDirections = [];

var city = 'CHICAGO';

db.getAllDirectionsData(city, function(err, rows) {
  if (err) {
    console.error(err);
  } else {
    for (var i = 0; i < rows.length; ++i) {
      allDirections.push({
        lat: rows[i].lat,
        lng: rows[i].lng
      });
    }
    var outFile = fs.openSync('./directionsCoords.json', 'w');
    fs.write(outFile, JSON.stringify(allDirections));
  }
});
