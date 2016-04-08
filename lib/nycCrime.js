/**
 * Created by Tommy on 4/6/2016.
 */
var geolib = require('geolib');
var async = require('async');
var db = require('./db');
var makeRequest = require('./makeRequest');
var communitiesPctOfAvg = require('./communitiesPctOfAvg');

var key = 'BhFTl13BHQM09tpqrSlBs7XNI';
var crimeURL = 'https://data.cityofnewyork.us/resource/e4qk-cpnv.json';

function allCrimeInNYC(communities, callback) {
  var pageSize = 500;

  async.timesSeries(2, function(n, next) {
    crimeInNYC(communities, n * pageSize, pageSize, function(err, result) {
      console.log('finshed', n);
      if (err) {
        console.error(err);
        return next(err);
      } else {
        communities = result;
        return next();
      }
    });
  }, function(err) {
    if (err) {
      return callback(err);
    } else {
      return callback(null, communities);
    }
  });
}

function crimeInNYC(communities, offset, limit, callback) {
  var params = {
    $$app_token: key,
    $offset: offset,
    $limit: limit,
    occurrence_year: 2015
  };

  makeRequest(crimeURL, params, function(err, res) {
    if (err) {
      return callback(err);
    } else {
      if (!res.length) {
        return callback(null, communities);
      }

      for (var i = 0; i < res.length; ++i) {
        var latLng = {
          longitude: res[i].location_1.coordinates[0],
          latitude: res[i].location_1.coordinates[1]
        };
        var communityName = getCommunityCoordinate(latLng, communities);
        if (communityName) {
          ++communities[communityName].crimes;
        }
      }
      return callback(null, communities);
    }
  });
}

function getCommunityCoordinate(latLng, communities) {
  for (var name in communities) {
    if (communities.hasOwnProperty(name) &&
        geolib.isPointInside(latLng, communities[name].outline)) {
      return name;
    }
  }
  return undefined;
}

function getCommunitiesPolygons(callback) {
  db.getAllCommunitiesInfo('NEWYORK', function(err, result) {
    if (err) {
      return callback(err);
    } else {
      var formattedResult = {};
      result.map(function(community) {
        var outline = JSON.parse(community.outline);
        var reformattedOutline = outline.map(function(latLng) {
          latLng.latitude = latLng.lat;
          latLng.longitude = latLng.lng;
          delete latLng.lat;
          delete latLng.lng;
          return latLng;
        });
        formattedResult[community.name] = {
          outline: reformattedOutline,
          crimes: 0
        };
      });
      callback(null, formattedResult);
    }
  });
}

var start = new Date();
getCommunitiesPolygons(function(err, res) {
  allCrimeInNYC(res, function(err2, communities) {
    Object.keys(communities).map(function(name) {
      console.log(name, communities[name].crimes);
    });
    var end = new Date();
    console.log('Time elapsed', (end - start) / 1000)
    db.insertNYCCrime(communities);
  });
});