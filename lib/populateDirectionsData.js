/**
 * Created by Tommy on 2/15/2016.
 */
var async = require('async');
var directionsCommunities = require('./directionsCommunities');
var db = require('./db');

function createBoundariesArr(boundaries) {
  var boundariesArr = [];
  var numDivisions = 23;
  var latStep = ((boundaries.nw.lat - boundaries.se.lat) /
                  numDivisions);
  var lngStep = ((boundaries.nw.lng - boundaries.se.lng) /
                  numDivisions);
  for (var lat = 0; lat < numDivisions; ++lat) {
    for (var lng = 0; lng < numDivisions; ++lng) {
      boundariesArr[(lat * numDivisions) + lng] =
          { lat: boundaries.nw.lat - (latStep * lat),
            lng: boundaries.nw.lng - (lngStep * lng) };
    }
  }
  return boundariesArr;
}

function populateDirections(boundaries, callback) {
  var boundariesArr = createBoundariesArr(boundaries);
  var directionsByLatLng = {};
  async.each(boundariesArr, function(latLng, cb) {
    var drivingPreferences = {
      destination: latLng.lat.toString() + ',' + latLng.lng.toString(),
      mode: 'driving'
    };
    directionsCommunities.getTimeToCommunities(drivingPreferences,
                                                function(err, result) {
      if (err) {
        console.error(err);
      } else {
        console.log('Successfully added', drivingPreferences.destination);
        directionsByLatLng[drivingPreferences.destination] = result;
      }
      return cb();
    });
  }, function(err) {
    if (err) {
      return callback(err);
    } else {
      db.insertAllDirectionsData(directionsByLatLng);
      return callback();
    }
  });
}

populateDirections({
  nw: { lat: 42.028974, lng: -87.865046 },
  se: { lat: 41.643075, lng: -87.525375 }
}, function(err) {
  if (err) {
    console.error(err);
  }
});

/*
points mapped so far
 41.993122,-87.599302826087
 41.993122,-87.7619440434783
 41.993122,-87.6140883913044
 41.993122,-87.7028017826087
 41.993122,-87.791515173913
 41.993122,-87.7175873478261
 41.993122,-87.7471584782609
 41.993122,-87.6880162173913
 41.993122,-87.8063007391304
 41.993122,-87.6288739565217
 41.993122,-87.6436595217391
 41.993122,-87.6584450869565
 41.993122,-87.7767296086956
 41.993122,-87.6732306521739
 41.993122,-87.7323729130435
 41.993122,-87.8358718695652
 41.993122,-87.8210863043478
 41.993122,-87.865443
 41.993122,-87.8506574347826
 41.97790256521739,-87.865443
 */