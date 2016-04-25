var request = require('request');

module.exports = function(url, params, cb) {
  request({ url: url, qs: params, json: true },
            function(error, response, body) {
    if (error) {
      cb(new Error(error));
    } else if (response.statusCode != 200) {
      cb(new Error('Response Code: ' + response.statusCode + '; ' + body));
    } else {
      cb(null, body);
    }
  });
};
