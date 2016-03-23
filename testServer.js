var express = require('express');
var fs = require('fs');
var app = express();
app.set('views', __dirname);
app.set('view engine', 'jade');

var pointString = fs.readFileSync('./lib/unusedPoints.txt');
var directionsString = fs.readFileSync('./lib/directionsCoords.json');

app.get('/', function(req, res) {
  res.render('index.jade', { points: pointString });
});

app.get('/directions', function(req, res) {
  res.render('index.jade', { points: directionsString });
});

app.listen(8080, function() {
  console.log('open on 8080');
});
