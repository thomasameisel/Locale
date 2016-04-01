/**
 * Created by Tommy on 3/30/2016.
 */
var RateLimiter = require('limiter').RateLimiter;
var makeRequest = require('./makeRequest');

var limiter = new RateLimiter(80, 'hour');

var key = '6ad3eae3512f6fe2d6aae88a91db5773b1dbef33';

var infoURL = 'http://streeteasy.com/nyc/api/areas/info';
var rentalURL = 'http://streeteasy.com/nyc/api/rentals/data';

function findID(name, callback) {
  var params = {
    id: name,
    key: key,
    format: 'json'
  };
  makeStreetEasyRequest(infoURL, params, function(err, res) {
    if (err) {
      callback(err);
    } else {
      callback(null, res.path);
    }
  });
}

function averageOneBedroomRental(id, callback) {
  var params = {
    critera: 'area:' + id + '|beds:1',
    key: key,
    format: 'json'
  };
  makeStreetEasyRequest(infoURL, params, function(err, res) {
    if (err) {
      callback(err);
    } else {
      callback(null, res.average_price);
    }
  });
}

function makeStreetEasyRequest(URL, params, callback) {
  limiter.removeTokens(1, function() {
    makeRequest(URL, params, callback);
  });
}

module.exports = {
  findID: findID
}