var parseString = require('xml2js').parseString;
var fs = require('fs');
var xml = fs.readFileSync('./Chicago Community Areas.kml');

parseString(xml, function(err, result) {
  if (err) {
    console.error(err);
  } else {
    var communities = result.kml.Document[0].Folder[0].Placemark;
    var outFile = fs.openSync('./output.txt', 'w');
    for (var i = 0; i < communities.length; ++i) {
      var name = communities[i].name[0];
      var coords = communities[i].Polygon[0].outerBoundaryIs[0].LinearRing[0].coordinates[0].split(' ');
      var completed = [];
      for (var j = 0; j < coords.length; ++j) {
        var coordArray = coords[j].split(',');
        var obj = '{"lng": '+coordArray[0]+', "lat": '+coordArray[1]+'}';
        completed.push(obj);
      }
      var output = name + ': [' + completed + ']\n';
      fs.write(outFile, output);
    }
    // console.log(polygons);
  }
});
