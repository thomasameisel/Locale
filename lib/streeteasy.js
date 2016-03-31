/**
 * Created by Tommy on 3/30/2016.
 */
var RateLimiter = require('limiter').RateLimiter;
var makeRequest = require('./makeRequest');

var key = '6ad3eae3512f6fe2d6aae88a91db5773b1dbef33';

var infoURL = 'http://streeteasy.com/nyc/api/areas/info';
var rentalURL = 'http://streeteasy.com/nyc/api/rentals/data';

function findID(name, callback) {
  var params = {
    id: name,
    key: key,
    format: 'json'
  };
  makeRequest(infoURL, params, function(err, res) {
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
  makeRequest(infoURL, params, function(err, res) {
    if (err) {
      callback(err);
    } else {
      callback(null, res.average_price);
    }
  });
}

module.exports = {
  findID: findID
}