/**
 * Created by Tommy on 2/14/2016.
 */
var directions = require('./directions');
var db = require('./db');

function getTooFarCommunities(drivingPreferences, callback) {
  db.getAllCommunitiesInfo(function(err, communitiesInfo) {
    if (err) {
      callback(err);
    } else {
      directions.getTooFarCommunities(communitiesInfo, drivingPreferences,
          function(err, result) {
        if (err) {
          callback(err);
        } else {
          callback(null, result);
        }
      });
    }
  });
}

var startTime = new Date().getTime();
getTooFarCommunities(
    {
      destination: '201 S Wacker Dr, Chicago, IL',
      mode: 'driving',
      maxTimeMinutes: 20
    }, function(err, result) {
  var endTime = new Date().getTime();
  console.log((endTime - startTime) / 100 + ' seconds elapsed');
  console.log(result);
});

module.exports = {
  getTooFarCommunities: getTooFarCommunities
};
