/**
 * Created by chrissu on 12/12/15.
 */
var preferencesCommunities = require('./lib/preferencesCommunities');
var directionsCommunities = require('./lib/directionsCommunities');
var validator = require('validator');
var express = require('express');

var app = express();

app.use(express.static('public'));

function validOp(op) {
  return op === '<' || op === '>';
}

function validNum(num) {
  return validator.isInt(num) && num > 0 && num < 6;
}

function validParam(param) {
  var valid = {
    violentCrime: true,
    nonViolentCrime: true,
    nightlife: true,
    price: true,
    crowded: true
  };
  if (valid[param]) {
    return true;
  } else {
    return false;
  }
}

function validParams(opsAndNums) {
  for (var preference in opsAndNums) {
    if (opsAndNums.hasOwnProperty(preference) &&
          (!validOp(opsAndNums[preference].op) ||
          !validNum(opsAndNums[preference].num) ||
          !validParam(preference))) {
      return false;
    }
  }
  return true;
}

// jscs:disable
// http://localhost:8080/preferences?violentCrime[op]=%3C&nonViolentCrime[op]=%3C&nightlife[op]=%3E&price[op]=%3C&crowded[op]=%3C&violentCrime[num]=4&nonViolentCrime[num]=3&nightlife[num]=4&price[num]=4&crowded[num]=2
// jscs:enable
app.get('/preferences', function(req, res) {
  console.log(req.query);
  if (validParams(req.query)) {
    var params = {
      violentCrimePctOfAvg: [req.query.violentCrime.op,
                              req.query.violentCrime.num],
      nonViolentCrimePctOfAvg: [req.query.nonViolentCrime.op,
                                req.query.nonViolentCrime.num],
      nightlifePctOfAvg: [req.query.nightlife.op, req.query.nightlife.num],
      pricePctOfAvg: [req.query.price.op, req.query.price.num],
      crowdedPctOfAvg: [req.query.crowded.op, req.query.crowded.num]
    };
    preferencesCommunities.communitiesByPreferences(params,
                                                    function(err, result) {
      if (err) {
        res.send('<p>Error with request</p>');
      } else {
        res.send(result);
      }
    });
  } else {
    res.send('<p>Error with request</p>');
  }
});

// jscs:disable
// http://localhost:8080/directions?destination=201%20S%20Wacker%20Dr,%20Chicago,%20IL&mode=driving
// jscs:enable
app.get('/directions', function(req, res) {
  console.log(req.query);
  if (req.query.destination && req.query.mode &&
      (req.query.mode === 'driving' || req.query.mode === 'transit')) {
    var params = {
      destination: req.query.destination,
      mode: req.query.mode
    };
    directionsCommunities.getTimeToCommunities(params, function(err, result) {
      if (err) {
        res.send('<p>Error with request</p>');
      } else {
        res.send(result);
      }
    });
  } else {
    res.send('<p>Error with request</p>');
  }
});


app.listen(8080, function() {
  console.log('listening to port localhost:8080');
});
