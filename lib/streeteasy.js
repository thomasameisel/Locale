/**
 * Created by Tommy on 3/30/2016.
 */
var RateLimiter = require('limiter').RateLimiter;
var makeRequest = require('./makeRequest');

var key = '6ad3eae3512f6fe2d6aae88a91db5773b1dbef33';

var infoURL = 'http://streeteasy.com/nyc/api/areas/info';

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

module.exports = {
  findID: findID
}