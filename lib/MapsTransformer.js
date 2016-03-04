var parseString = require('xml2js').parseString;
var geolib = require('geolib');
var geoJsonArea = require('geojson-area');
var fs = require('fs');
var trualiData = require('./truliaData');
var db = require('./db');

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

function getArea(communityInfo) {
  var polygonObj = createPolygon(communityInfo.outline);
  return geoJsonArea.geometry(polygonObj);
}

function getCenter(communityInfo) {
  return geolib.getCenter(communityInfo.outline);
}

function getRadius(communityInfo, center) {
  var coordinatesArr = communityInfo.outline;
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
  trualiData.getNeighborhoodsInCity('Chicago', 'IL', function(err, xml) {
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

function addAllProperties(communities, callback) {
  for (var community in communities) {
    if (communities.hasOwnProperty(community)) {
      var communityInfo = communities[community];
      communityInfo.center = getCenter(communityInfo);
      communityInfo.landArea = getArea(communityInfo);
      communityInfo.radius = getRadius(communityInfo,
                                        communityInfo.center);
      communityInfo.center = communityInfo.center.latitude.toString() +
          ',' + communityInfo.center.longitude.toString();
    }
  }
  assignTruliaID(communities, function(err, result) {
    // console.log(result);
    callback(err, result);
  });
}

kmlToJSON('./Chicago Community Areas.kml', function(err, result) {
  addAllProperties(result, function(err2, result2) {
    db.insertAllCommunityAreas(result2);
  });
});

module.exports = {
  kmlToJSON: kmlToJSON
};