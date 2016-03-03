var geolib = require('geolib');
var RateLimiter = require('limiter').RateLimiter;

var db = require('./db');
var makeRequest = require('./makeRequest');

// Maps communityID to {outline, points: [{point:{lat/lng}, score},...], avg}
var mainObject = {};
db.getAllCommunitiesInfo(function(err, rows) {
  if (err) {
    console.error(err);
  } else {
    for (var i = 0; i < rows.length; ++i) {
      var communityID = rows[i].communityID;
      var outline = JSON.parse(rows[i].outline);
      mainObject[communityID] = {
        outline: outline,
        points: [],
        avg: -1
      };
    }
    createPointsArr(CHICAGO_BOUNDS);

    var limiter = new RateLimiter(10, 'second');
    for (var commID = 1; commID <= 77; ++commID) {
      for (var p = 0; p < mainObject[commID].points; ++p) {
        limiter.removeTokens(1, function() {
          const URL = 'http://elb1.howloud.com/score';
          var params = {
            key: 'GbXjeNeezekqlAFK',
            latitude: mainObject[commID].points[p].point.lat,
            longitude: mainObject[commID].points[p].point.lng
          };
          makeRequest(URL, params, function(err, response) {
            if (err) {
              console.error(err);
            } else {
              mainObject[commID].points[p].score = response.result[0].score;
            }
          });
        });
      }
    }
  }
});

/* Begin calculate points */
// Gives approximately 1000 points that are in community bounds
const NUM_DIVISIONS = 50;
const CHICAGO_BOUNDS = {
  nw: { lat: 42.022635, lng: -87.940412 },
  se: { lat: 41.644164, lng: -87.525322 }
};

function createPointsArr(boundaries) {
  // var unusedPoints = [];
  // var validPoints = 0;
  var latStep = ((boundaries.nw.lat - boundaries.se.lat) /
                  NUM_DIVISIONS);
  var lngStep = ((boundaries.nw.lng - boundaries.se.lng) /
                  NUM_DIVISIONS);
  for (var lat = 0; lat < NUM_DIVISIONS; ++lat) {
    for (var lng = 0; lng < NUM_DIVISIONS; ++lng) {
      var point = { lat: boundaries.nw.lat - (latStep * lat),
                    lng: boundaries.nw.lng - (lngStep * lng) };
      // var unmapped = true;
      for (var commID = 1; commID <= 77; ++commID) {
        if (geolib.isPointInside(point, mainObject[commID].outline)) {
          mainObject[commID].points.push({ point: point });
          // validPoints++;
          // unmapped = !unmapped;
        }
      }
      // if (unmapped) {
      //   unusedPoints.push(point);
      // }
    }
  }
  // var fs = require('fs');
  // var unusedString = JSON.stringify(unusedPoints);
  // var outFile = fs.openSync('./unusedPoints.txt', 'w');
  // fs.write(outFile, unusedString);
  // console.log('Total valid points: ' + validPoints);
}
