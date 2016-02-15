/**
 * Created by chrissu on 12/12/15.
 */
var preferencesCommunities = require('./lib/preferencesCommunities');
var directionsCommunities = require('./lib/directionsCommunities');
var validator = require('validator');
var express = require('express');

var app = express();

app.use(express.static('public'));

function validOps(ops) {
  for (var op in ops) {
    if (ops[op] !== '<' && ops[op] !== '>') {
      return false;
    }
  }
  return true;
}

function validNums(nums) {
  for (var num in nums) {
    if (!validator.isInt(nums[num]) || num < 1 || num > 5) {
      return false;
    }
  }
  return true;
}

function validParams(opsAndNums) {
  return opsAndNums.ops && opsAndNums.nums && validOps(opsAndNums.ops) &&
      validNums(opsAndNums.nums);
}

// jscs:disable
// http://localhost:8080/preferences?ops[violentCrime]=%3C&ops[nonViolentCrime]=%3C&ops[nightlife]=%3E&ops[price]=%3C&ops[crowded]=%3C&nums[violentCrime]=4&nums[nonViolentCrime]=3&nums[nightlife]=4&nums[price]=4&nums[crowded]=2
// jscs:enable
app.get('/preferences', function(req, res) {
  if (validParams(req.query)) {
    var params = {
      violentCrimePctOfAvg: [req.query.ops.violentCrime,
                              req.query.nums.violentCrime],
      nonViolentCrimePctOfAvg: [req.query.ops.nonViolentCrime,
                                req.query.nums.nonViolentCrime],
      nightlifePctOfAvg: [req.query.ops.nightlife, req.query.nums.nightlife],
      pricePctOfAvg: [req.query.ops.price, req.query.nums.price],
      crowdedPctOfAvg: [req.query.ops.crowded, req.query.nums.crowded]
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
