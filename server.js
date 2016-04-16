/**
 * Created by chrissu on 12/12/15.
 */
var preferencesCommunities = require('./lib/preferencesCommunities');
var directionsCommunities = require('./lib/directionsCommunities');
var cities = require('./lib/cities');
var validator = require('validator');
var express = require('express');
var addressValidator = require('address-validator');
var toobusy = require('toobusy-js');

var app = express();

app.use(express.static('public'));

function keyByValue(value, obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key) && obj[key] === value) {
      return key;
    }
  }
  return undefined;
}

function validOp(op) {
  return op === '<' || op === '>';
}

function validNum(num) {
  return validator.isInt(num) && num > 0 && num < 6;
}

function validParam(allPreferences, param) {
  return typeof allPreferences[param] !== 'undefined';
}

function validatePreferencesParams(preferences) {
  var allPreferences = {
    safety: true,
    qualityOfLife: true,
    nightlife: true,
    affordability: true,
    breathingRoom: true
  };
  for (var preference in preferences) {
    if (preferences.hasOwnProperty(preference) &&
          preference !== 'city' &&
          (!validParam(allPreferences, preference) ||
          !validNum(preferences[preference]))) {
      return false;
    }
  }
  if (validator.isAlpha(preferences.city)) {
    for (var city in cities) {
      if (cities.hasOwnProperty(city) &&
          cities[city] == preferences.city) {
        return true;
      }
    }
  }

  return false;
}

// function validateAddress(address, callback) {
//   if (!address) {
//     return callback(false);
//   }
//   addressValidator.validate(address, addressValidator.match.streetAddress,
//                             function(err, exact, inexact) {
//     if (err) {
//       return callback(false);
//     } else {
//       var addressType = (exact.length > 0) ? exact : inexact;
//       var city;
//       var location;
//       if (addressType.length > 0) {
//         city = addressType[0].city;
//         location = addressType[0].location;
//       }
//       callback(addressType.length > 0, city, location);
//     }
//   });
// }

function validateLatLng(lat, lng) {
  const maxLat = 90;
  const maxLng = 180;
  return validator.isFloat(lat, { min: -maxLat, max: maxLat }) &&
         validator.isFloat(lng, { min: -maxLng, max: maxLng });
}

function validateDirectionsParams(req, callback) {
  // validateAddress(req.query, callback);
  if (!req.query.lat || !req.query.lng || !req.query.city ||
      !validateLatLng(req.query.lat, req.query.lng)) {
    return callback(false);
  } else {
    var latLng = {
      lat: Number(req.query.lat),
      lng: Number(req.query.lng)
    };
    return callback(true, req.query.city, latLng);
  }
}

// middleware which blocks requests when we're too busy
app.use(function(req, res, next) {
  if (toobusy()) {
    res.send(503, 'Server is busy');
  } else {
    next();
  }
});

// jscs:disable
// http://localhost:8080/preferences?safety=4&qualityOfLife=3&nightlife=4&affordability=4&breathingRoom=2&city=Chicago
// jscs:enable
app.get('/preferences', function(req, res) {
  // console.log(req.query);
  console.log('GET /preferences');
  if (validatePreferencesParams(req.query)) {
    var params = {
      violentCrimePctOfAvg: {op: '<',
                              num: 6 - parseInt(req.query.safety)},
      nonViolentCrimePctOfAvg: {op: '<',
                                num: 6 - parseInt(req.query.qualityOfLife)},
      nightlifePctOfAvg: {op: (req.query.nightlife > 3) ? '>' : '<',
                          num: parseInt(req.query.nightlife)},
      pricePctOfAvg: {op: '<',
                      num: 6 - parseInt(req.query.affordability)},
      crowdedPctOfAvg: {op: '<',
                        num: 6 - parseInt(req.query.breathingRoom)},
      city: keyByValue(req.query.city, cities)
    };
    var start = new Date();
    preferencesCommunities.communitiesByPreferences(params,
                                                    function(err, result) {
      if (err) {
        res.send('<p>Error with request</p>');
      } else {
        res.send(result);
      }
      var end = new Date();
      console.log('Time elapsed:', (end - start) / 1000, 's');
    });
  } else {
    res.send('<p>Preferences are not valid</p>');
  }
});

// jscs:disable
// http://localhost:8080/directions?destination=201%20S%20Wacker%20Dr,%20Chicago,%20IL
// jscs:enable
app.get('/directions', function(req, res) {
  // console.log(req.query);
  console.log('GET /directions');
  validateDirectionsParams(req, function(valid, city, latLng) {
    if (valid) {
      var start = new Date();
      directionsCommunities.getClosestLatLng(keyByValue(city, cities), latLng,
          function(err, result) {
        if (err) {
          res.status(500).send(err);
        } else {
          res.send(result);
        }
        var end = new Date();
        console.log('Time elapsed:', (end - start) / 1000, 's');
      });
    } else {
      res.status(400).send('<p>Address is not valid</p>');
    }
  });
});

var server = app.listen(8080, function() {
  console.log('listening to port localhost:8080');
});

process.on('SIGINT', function() {
  server.close();
  // calling .shutdown allows your process to exit normally
  toobusy.shutdown();
  process.exit();
});
