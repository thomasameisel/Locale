/**
 * Created by Tommy on 2/15/2016.
 */
var async = require('async');
var directionsCommunities = require('./directionsCommunities');
var db = require('./db');

function createBoundariesArr(boundaries) {
  var boundariesArr = [];
  var numDivisions = 10;
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
  // following array slice has already been completed
  boundariesArr = boundariesArr.slice(10, 20);
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
        directionsByLatLng[drivingPreferences.destination] = result;
      }
      cb();
    });
  }, function(err) {
    if (err) {
      callback(err);
    } else {
      db.insertAllDirectionsData(directionsByLatLng);
      callback();
    }
  });
}

populateDirections({
  nw: { lat: 41.993122, lng: -87.865443 },
  se: { lat: 41.643075, lng: -87.525375 }
}, function(err) {
  if (err) {
    console.log(err);
  }
});