/**
 * Created by chrissu on 12/12/15.
 */
var http = require('http');
var express = require('express');

var app = express();

app.use(express.static('public'));

app.listen(8080, function() {
  console.log('listening to port localhost:8080');
});

