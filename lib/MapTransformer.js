var parseString = require('xml2js').parseString;
var geolib = require('geolib');
var geoJsonArea = require('geojson-area');
var fs = require('fs');
var async = require('async');
var trualiData = require('./truliaData');
var db = require('./db');
var streetEasy = require('./streeteasy');

function getNameIdObj(nameId) {
  var nameIdArr = nameId.split(' ');
  var communityName = '';
  for (var i = 0; i < nameIdArr.length - 1; ++i) {
    communityName += nameIdArr[i];
    if (i < nameIdArr.length - 2) {
      communityName += ' ';
    }
  }
  var communityID = nameIdArr[nameIdArr.length - 1]
    .split('(')[1]
    .split(')')[0];
  return {
    name: communityName,
    id: communityID
  };
}

function kmlToJSON(filename, callback) {
  var xml = fs.readFileSync(filename);
  var communitiesObj = {};
  parseString(xml, function(err, json) {
    if (err) {
      callback(err);
    } else {
      var communities = json.kml.Document[0].Folder[0].Placemark;
      for (var i = 0; i < communities.length; ++i) {
        var nameId = communities[i].name[0];
        var coords = communities[i].Polygon[0].outerBoundaryIs[0]
          .LinearRing[0].coordinates[0].split(' ');
        var completed = [];
        for (var j = 0; j < coords.length; ++j) {
          var coordArray = coords[j].split(',');
          obj = {
            longitude: parseFloat(coordArray[0]),
            latitude: parseFloat(coordArray[1])
          };
          completed.push(obj);
        }
        var nameIdObj = getNameIdObj(nameId);
        communitiesObj[nameIdObj.id] = {
          name: nameIdObj.name,
          outline: completed
        };
      }
      callback(null, communitiesObj);
    }
  });
}

function createPolygon(pointsArr) {
  var polygonObj = {};
  polygonObj.type = 'MultiPolygon';
  polygonObj.coordinates = [];
  var outerArr = [];
  var innerArr = [];
  for (var i = 0; i < pointsArr.length; ++i) {
    var coordinate = [pointsArr[i].latitude, pointsArr[i].longitude];
    innerArr.push(coordinate);
  }
  outerArr.push(innerArr);
  polygonObj.coordinates.push(outerArr);
  return polygonObj;
}

function getArea(outline) {
  var polygonObj = createPolygon(outline);
  return geoJsonArea.geometry(polygonObj);
}

function getCenter(outline) {
  return geolib.getCenter(outline);
}

function getRadius(outline, center) {
  var coordinatesArr = outline;
  return coordinatesArr.reduce(function(previousValue, currentValue) {
    var distance = geolib.getDistance(currentValue, center);
    return Math.max(previousValue, distance);
  }, 0);
}

function assignTruliaIDCommunity(truliaData, community) {
  for (var i = 0; i < truliaData.length; ++i) {
    if (truliaData[i].name[0] === community.name) {
      community.truliaID = parseInt(truliaData[i].id[0]);
      return community;
    }
  }
  console.error('cannot find truliaID for community', community.name);
  return community;
}

function assignTruliaID(communities, callback) {
  trualiData.getNeighborhoodsInCity('New York', 'NY', function(err, xml) {
    if (err) {
      return callback(err);
    } else {
      parseString(xml, function(err, json) {
        if (err) {
          return callback(err);
        } else {
          var neighborhoodsArr =
              json.TruliaWebServices.response[0].LocationInfo[0].neighborhood;
          for (var id in communities) {
            communities[id] =
                assignTruliaIDCommunity(neighborhoodsArr, communities[id]);
          }
          return callback(null, communities);
        }
      });
    }
  });
}

function assignStreetEasyID(communities, callback) {
  async.forEachOf(communities, function(value, key, cb) {
    streetEasy.findID(key, function(err, result) {
      if (err) {
        console.error(err);
      } else {
        communities[key].streetEasyID = result;
      }
      cb();
    });
  }, callback);
}

function addAllProperties(communities, callback) {
  for (var community in communities) {
    if (communities.hasOwnProperty(community)) {
      var communityInfo = communities[community];
      communityInfo.center = getCenter(communityInfo.outline);
      communityInfo.landArea = getArea(communityInfo.outline);
      communityInfo.radius = getRadius(communityInfo.outline,
                                        communityInfo.center);
      communityInfo.center = communityInfo.center.latitude.toString() +
          ',' + communityInfo.center.longitude.toString();
      for (var i = 0; i < communityInfo.outline.length; ++i) {
        communityInfo.outline[i].lat = communityInfo.outline[i].latitude;
        communityInfo.outline[i].lng = communityInfo.outline[i].longitude;
        delete communityInfo.outline[i].latitude;
        delete communityInfo.outline[i].longitude;
      }
    }
  }
  assignTruliaID(communities, callback);
}

function addAllPropertiesNYC(communities, callback) {
  var communitiesObj = {};
  for (var i = 0; i < communities.length; ++i) {
    var name = communities[i].properties.neighborhood;
    var borough = communities[i].properties.borough;
    var outlineArr = communities[i].geometry.coordinates[0];
    var outline = [];
    for (var j = 0; j < outlineArr.length; ++j) {
      outline.push({
        longitude: outlineArr[j][0],
        latitude: outlineArr[j][1]
      });
    }
    var communityInfo = { borough: borough, outline: outline };
    communityInfo.center = getCenter(communityInfo.outline);
    communityInfo.landArea = getArea(communityInfo.outline);
    communityInfo.radius = getRadius(communityInfo.outline,
        communityInfo.center);
    communityInfo.center = communityInfo.center.latitude.toString() +
      ',' + communityInfo.center.longitude.toString();
    for (var k = 0; k < communityInfo.outline.length; ++k) {
      communityInfo.outline[k].lat = communityInfo.outline[k].latitude;
      communityInfo.outline[k].lng = communityInfo.outline[k].longitude;
      delete communityInfo.outline[k].latitude;
      delete communityInfo.outline[k].longitude;
    }
    communitiesObj[name] = communityInfo;
  }
  assignStreetEasyID(communitiesObj, callback);
}

/*kmlToJSON('./Chicago Community Areas.kml', function(err, result) {
  addAllProperties(result, function(err2, result2) {
    db.insertAllCommunityAreas('CHICAGO', result2);
  });
});*/

var nycMapFile = fs.readFileSync('./NYC Neighborhoods.geojson');
var nycMap = JSON.parse(nycMapFile).features;
addAllPropertiesNYC(nycMap, function(err, result) {
  if (err) {
    console.log(err);
  } else {
    fs.writeFileSync('nyc.txt', result);
    db.insertAllCommunityAreas('NEWYORK', result);
  }
});