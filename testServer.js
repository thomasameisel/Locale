var express = require('express');
var fs = require('fs');
var app = express();
app.set('views', __dirname);
app.set('view engine', 'jade');

var pointString = fs.readFileSync('./lib/unusedPoints.txt');

app.get('/', function(req, res) {
  res.render('index.jade', { points: pointString});
});

app.listen(8080, function() {
  console.log('open on 8080');
});
