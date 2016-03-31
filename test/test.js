// Prevent jshint from complaining about `should.be.NaN`
// jshint expr:true
var rewire = require('rewire');
var chai = require('chai');
var should = chai.should();
var sinon = require('sinon');
chai.use(require('sinon-chai'));

describe('CommunitiesPctOfAvg', function() {
  var pctOfAvg = require('../lib/communitiesPctOfAvg');

  describe('getAllData', function() {
    var fakeCommInfo = [{ communityID: 1 }, { communityID: 2 },
                        { communityID: 3 }];
    var stub;
    beforeEach(function() {
      stub = sinon.stub();
      // Make stub call the second parameter with null and a number. Used to
      // pass a fake result to the callback
      stub.callsArgWith(1, null, 2);
    });

    it('should call the given function on each community', function(done) {
      pctOfAvg.getAllData(fakeCommInfo, stub, function(err, ignore) {
        if (err) {
          done(err);
        } else {
          stub.should.have.callCount(fakeCommInfo.length);
          done();
        }
      });
    });

    it('should finish and log if an error occurs', function(done) {
      var errorStub = sinon.stub(console, 'error');
      stub.onCall(1).callsArgWith(1, 'Error occurred');
      pctOfAvg.getAllData(fakeCommInfo, stub, function(err, result) {
        errorStub.restore();
        stub.should.have.callCount(fakeCommInfo.length);
        errorStub.should.have.been.calledWith('Error on communityID ' +
            fakeCommInfo[1].communityID + ': Error occurred');
        done();
      });
    });

    it('should finish and log if one function fails to return', function(done) {
      var errorStub = sinon.stub(console, 'error');
      stub.onCall(1).callsArgWith(1, null, null);
      pctOfAvg.getAllData(fakeCommInfo, stub, function(err, result) {
        errorStub.restore();
        stub.should.have.callCount(fakeCommInfo.length);
        errorStub.should.have.been.calledWith('No result returned for ' +
            'communityID ' + fakeCommInfo[1].communityID);
        done();
      });
    });
  });

  describe('getAvgData', function() {
    var fakeCommData = [{ data: 5 }, { data: 3 }];

    it('should return the average of a list', function() {
      var retVal = pctOfAvg.getAvgData(fakeCommData);
      retVal.should.equal(4);
    });
  });

  describe('getPctOfAvg', function() {
    it('should return the percent of average of each list item', function() {
      var fakeCommData = [{ communityID: 1, data: 5 },
                          { communityID: 2, data: 3 }];

      var retVal = pctOfAvg.getPctOfAvg(fakeCommData, 4);
      retVal[1].should.equal(1.25);
      retVal[2].should.equal(0.75);
    });
  });

  describe('communitiesPctOfAvg', function() {
    it('should return the pct of avg for each community', function(done) {
      var fakeCommInfo = [{ communityID: 1 }, { communityID: 2 },
          { communityID: 3 }];
      pctOfAvg.communitiesPctOfAvg(fakeCommInfo,
          function(community, callback) {
            callback(null, community.communityID);
          },
          function(err, result) {
            result[1].should.equal(0.5);
            result[2].should.equal(1);
            result[3].should.equal(1.5);
            done();
          }
      );
    });
  });
});

describe('DB', function() {
  var sqlite3 = require('sqlite3');
  var database = rewire('../lib/db');
  var city = 'CHICAGO';

  // Swap to an in-memory database and create the schema
  var testDB = new sqlite3.Database(':memory:');
  before(function(done) {
    database.__set__('dbs.CHICAGO', testDB);

    // Turn off jscs so it doesn't complain about mixing commas in SQL strings
    // jscs:disable
    var commAreaStr = "CREATE TABLE 'CommunityArea' (" +
        "`communityID` INTEGER UNIQUE,`name` TEXT NOT NULL," +
        "`landArea` INTEGER NOT NULL,`center` TEXT NOT NULL," +
        "`truliaID` INTEGER NOT NULL UNIQUE,`radius` INTEGER," +
        "`outline` TEXT NOT NULL,PRIMARY KEY(communityID))";
    var commDataStr = "CREATE TABLE 'CommunityData' (" +
        "`communityID` INTEGER UNIQUE,`violentCrimePctOfAvg` REAL," +
        "`nonViolentCrimePctOfAvg` REAL,`nightlifePctOfAvg` REAL," +
        "`crowdedPctOfAvg` REAL,`pricePctOfAvg` REAL," +
        "PRIMARY KEY(communityID)," +
        "FOREIGN KEY(`communityID`) REFERENCES `CommunityArea`(`communityID`))";
    var prefStatStr = "CREATE TABLE 'PreferencesStatistics' (" +
        "`statistic` TEXT UNIQUE,`violentCrimePctOfAvg` REAL," +
        "`nonViolentCrimePctOfAvg` REAL,`nightlifePctOfAvg` REAL," +
        "`crowdedPctOfAvg` REAL,`pricePctOfAvg` REAL," +
        "PRIMARY KEY(statistic))";
    var direcStr = 'CREATE TABLE CommunityDirections' +
      '(lat REAL NOT NULL,lng REAL NOT NULL,sinLat REAL NOT NULL,' +
      'cosLat REAL NOT NULL,sinLng REAL NOT NULL,cosLng REAL NOT NULL,';
    for (var i = 1; i <= 77; ++i) {
      direcStr += ('\'' + i.toString() + '\'' + ' REAL');
      if (i <= 76) {
        direcStr += ',';
      }
    }
    direcStr += ',PRIMARY KEY(lat,lng))';
    testDB.exec(commAreaStr).exec(commDataStr).exec(prefStatStr)
        .exec(direcStr);
    // jscs:enable
    done();
  });

  it('should use the test database', function(done) {
    database.getAllCommunitiesInfo(city, function(err, result) {
      if (err) {
        done(err);
      } else {
        result.should.have.length(0);
        done();
      }
    });
  });

  describe('getCommunityInfo', function() {
    before(function(done) {
      // Turn off jscs so it doesn't complain about mixing commas in SQL strings
      // jscs:disable
      testDB.exec("INSERT INTO CommunityArea VALUES (1, 'Loop', 5000," +
        "'12,12', 123, 456, '[{lat:1,lng:3}]')", done);
      // jscs:enable
    });

    after(function(done) {
      testDB.exec('DELETE FROM CommunityArea WHERE communityID=1', done);
    });

    it('should get single community info', function(done) {
      database.getCommunityInfo(city, 1, function(err, result) {
        if (err) {
          done(err);
        } else {
          result.should.have.all.keys('communityID', 'name', 'landArea',
              'center', 'outline', 'radius', 'truliaID');
          result.communityID.should.equal(1);
          done();
        }
      });
    });

    it('should not return results for community not in db', function(done) {
      database.getCommunityInfo(city, 100, function(err, result) {
        if (err) {
          done(err);
        } else {
          console.assert(typeof result === 'undefined');
          done();
        }
      })
    });
  });

  describe('getAllCommunitiesInfo', function() {
    before(function(done) {
      // Turn off jscs so it doesn't complain about mixing commas in SQL strings
      // jscs:disable
      testDB.exec("INSERT INTO CommunityArea VALUES (2, 'Deerfield', 5000, " +
          "'12,12', 123, 456, '[{lat:1,lng:3}]')", done);
      // jscs:enable
    });

    after(function(done) {
      testDB.exec('DELETE FROM CommunityArea WHERE communityID=2', done);
    });

    it('should return all communities', function(done) {
      database.getAllCommunitiesInfo(city, function(err, rows) {
        if (err) {
          done(err);
        } else {
          rows.should.have.length(1);
          rows[0].communityID.should.equal(2);
          done();
        }
      });
    });
  });

  describe('getPreferencesStatistics', function() {
    before(function(done) {
      var insertStmt = 'INSERT INTO PreferencesStatistics VALUES' +
          '("a", 0.5, 0.6, 0.2, 0.7, 0.3)';
      testDB.exec(insertStmt, function(err) {
        if (err) {
          done(err);
        } else {
          var insertStmt2 = 'INSERT INTO PreferencesStatistics VALUES' +
              '("b", 0.2, 0.3, 0.1, 0.9, 0.4)';
          testDB.exec(insertStmt2, done);
        }
      });
    });

    after(function(done) {
      testDB.exec('DELETE FROM PreferencesStatistics WHERE statistic="a" OR ' +
          'statistic="b"', done);
    });

    it('should return object with preferences keys', function(done) {
      database.getPreferencesStatistics(city, function(err, result) {
        if (err) {
          done(err);
        } else {
          result.should.have.all.keys('a', 'b');
          result.a.should.have.all.keys('violentCrimePctOfAvg',
              'nonViolentCrimePctOfAvg', 'pricePctOfAvg',
              'nightlifePctOfAvg', 'crowdedPctOfAvg');
          result.b.should.have.all.keys('violentCrimePctOfAvg',
              'nonViolentCrimePctOfAvg', 'pricePctOfAvg',
              'nightlifePctOfAvg', 'crowdedPctOfAvg');
          done();
        }
      });
    })
  });

  describe('insertCommunityData', function() {
    before(function(done) {
      var communityData = {
        violentCrimePctOfAvg: 0.6, nonViolentCrimePctOfAvg: 0.5,
        nightlifePctOfAvg: 0.4, crowdedPctOfAvg: 0.2, pricePctOfAvg: 0.7
      };
      var statsData = {
        violentCrimePctOfAvg: 0.6, nonViolentCrimePctOfAvg: 0.5,
        nightlifePctOfAvg: 0.4, crowdedPctOfAvg: 0.2, pricePctOfAvg: 0.7
      };
      var nullData = {
        violentCrimePctOfAvg: 'apple', nonViolentCrimePctOfAvg: undefined,
        nightlifePctOfAvg: 0.4, crowdedPctOfAvg: 0.2, pricePctOfAvg: 0.7
      };
      var updateDataBefore = {
        violentCrimePctOfAvg: 'apple', nonViolentCrimePctOfAvg: undefined,
        nightlifePctOfAvg: 0.4, crowdedPctOfAvg: 0.2, pricePctOfAvg: 0.7
      };
      database.insertCommunityData(city,
          9, updateDataBefore, 'CommunityData');
      database.insertCommunityData(city,
          8, nullData, 'CommunityData');
      database.insertCommunityData(city,
          5, communityData, 'CommunityData');
      database.insertCommunityData(city,
          'c', statsData, 'PreferencesStatistics');
      database.insertCommunityData(city,
          'd', statsData, 'PreferencesStatistics');
      done();
    });

    after(function(done) {
      testDB.exec('DELETE FROM CommunityData WHERE communityID=5 OR ' +
          'communityID=8 OR communityID=9');
      testDB.exec('DELETE FROM PreferencesStatistics WHERE ' +
          'statistic="c" OR statistic="d"');
      done();
    });

    it('should insert community data', function(done) {
      testDB.get('SELECT * from CommunityData WHERE communityID=5', [],
          function(err, row) {
        if (err) {
          done(err);
        } else {
          row.should.have.all.keys('communityID', 'violentCrimePctOfAvg',
              'nonViolentCrimePctOfAvg', 'pricePctOfAvg',
              'nightlifePctOfAvg', 'crowdedPctOfAvg');
          row.communityID.should.equal(5);
          row.violentCrimePctOfAvg.should.equal(0.6);
          row.nonViolentCrimePctOfAvg.should.equal(0.5);
          row.nightlifePctOfAvg.should.equal(0.4);
          row.crowdedPctOfAvg.should.equal(0.2);
          row.pricePctOfAvg.should.equal(0.7);
          done();
        }
      });
    });

    it('should insert statistics data', function(done) {
      testDB.all('SELECT * from PreferencesStatistics', function(err, rows) {
        if (err) {
          done(err);
        } else {
          rows.should.have.length(2);
          rows[0].should.have.all.keys('statistic', 'violentCrimePctOfAvg',
              'nonViolentCrimePctOfAvg', 'pricePctOfAvg',
              'nightlifePctOfAvg', 'crowdedPctOfAvg');
          rows[1].should.have.all.keys('statistic', 'violentCrimePctOfAvg',
              'nonViolentCrimePctOfAvg', 'pricePctOfAvg',
              'nightlifePctOfAvg', 'crowdedPctOfAvg');
          done();
        }
      });
    });

    it('should change any non-numbers to "NULL"', function(done) {
      testDB.get('SELECT * from CommunityData WHERE communityID=8', [],
          function(err, row) {
        if (err) {
          done(err);
        } else {
          row.should.have.all.keys('communityID', 'violentCrimePctOfAvg',
              'nonViolentCrimePctOfAvg', 'pricePctOfAvg',
              'nightlifePctOfAvg', 'crowdedPctOfAvg');
          row.communityID.should.equal(8);
          row.violentCrimePctOfAvg.should.equal('NULL');
          row.nonViolentCrimePctOfAvg.should.equal('NULL');
          row.nightlifePctOfAvg.should.equal(0.4);
          row.crowdedPctOfAvg.should.equal(0.2);
          row.pricePctOfAvg.should.equal(0.7);
          done();
        }
      });
    });

    it('should update row if already exists', function(done) {
      testDB.get('SELECT * from CommunityData WHERE communityID=9', [],
          function(err, row) {
        if (err) {
          done(err);
        } else {
          row.should.have.all.keys('communityID', 'violentCrimePctOfAvg',
              'nonViolentCrimePctOfAvg', 'pricePctOfAvg',
              'nightlifePctOfAvg', 'crowdedPctOfAvg');
          row.communityID.should.equal(9);
          row.violentCrimePctOfAvg.should.equal('NULL');
          row.nonViolentCrimePctOfAvg.should.equal('NULL');
          row.nightlifePctOfAvg.should.equal(0.4);
          row.crowdedPctOfAvg.should.equal(0.2);
          row.pricePctOfAvg.should.equal(0.7);

          var newData = {
            violentCrimePctOfAvg: 0.5, nonViolentCrimePctOfAvg: 0.1,
            nightlifePctOfAvg: 0.8, crowdedPctOfAvg: 0.3, pricePctOfAvg: null
          };
          database.insertCommunityData(city, 9, newData, 'CommunityData');
          testDB.get('SELECT * from CommunityData WHERE communityID=9', [],
              function(err, row) {
            if (err) {
              done(err);
            } else {
              row.should.have.all.keys('communityID', 'violentCrimePctOfAvg',
                  'nonViolentCrimePctOfAvg', 'pricePctOfAvg',
                  'nightlifePctOfAvg', 'crowdedPctOfAvg');
              row.communityID.should.equal(9);
              row.violentCrimePctOfAvg.should.equal(0.5);
              row.nonViolentCrimePctOfAvg.should.equal(0.1);
              row.nightlifePctOfAvg.should.equal(0.8);
              row.crowdedPctOfAvg.should.equal(0.3);
              row.pricePctOfAvg.should.equal('NULL');
              done();
            }
          });
        }
      });
    });
  });

  describe('insertAllCommunitiesData', function() {
    var communities = {
      10: {
        violentCrimePctOfAvg: 'apple', nonViolentCrimePctOfAvg: undefined,
        nightlifePctOfAvg: 0.4, crowdedPctOfAvg: 0.2, pricePctOfAvg: 0.7
      },
      11: {
        violentCrimePctOfAvg: 0.3, nonViolentCrimePctOfAvg: 0.4,
        nightlifePctOfAvg: 0.1, crowdedPctOfAvg: 0.9, pricePctOfAvg: 'hello'
      },
      e: {
        violentCrimePctOfAvg: 0.8, nonViolentCrimePctOfAvg: 0.1,
        nightlifePctOfAvg: 0.5, crowdedPctOfAvg: 0.6, pricePctOfAvg: 0.4
      }
    };

    before(function(done) {
      database.insertAllCommunitiesData(city, communities);
      // for some reason this makes everything work idk
      setTimeout(done, 1);
    });

    after(function(done) {
      testDB.exec('DELETE FROM CommunityData WHERE communityID=10 OR ' +
          'communityID=11');
      testDB.exec('DELETE FROM PreferencesStatistics WHERE ' +
          'statistic="e"');
      done();
    });

    it('should insert all communities given', function(done) {
      testDB.all('SELECT * FROM CommunityData', function(err, rows) {
        if (err) {
          done(err);
        } else {
          rows.should.have.length(2);
          for (var i = 0; i < rows.length; ++i) {
            rows[i].communityID.should.equal(i + 10);
            for (var key in communities[i]) {
              if (communities[i].hasOwnProperty(key)) {
                var val = communities[i][key];
                if (isNaN(val)) {
                  val = 'NULL';
                }
                rows[i][key].should.equal(val);
              }
            }
          }
          testDB.all('SELECT * FROM PreferencesStatistics',
              function(err, rows) {
            if (err) {
              done(err);
            } else {
              rows[0].statistic.should.equal('e');
              for (var key in communities.c) {
                if (communities.c.hasOwnProperty(key)) {
                  var val = communities.c[key];
                  if (isNaN(val)) {
                    val = 'NULL';
                  }
                  rows[0][key].should.equal(val);
                }
              }
              done();
            }
          });
        }
      });
    });
  });

  describe('insertDirectionsData', function() {
    var lat1 = 81.3;
    var lng1 = -23.4;
    var lat2 = 12.2;
    var lng2 = -34.6;

    before(function(done) {
      var latLng1 = lat1.toString() + ',' + lng1.toString();
      var latLng2 = lat2.toString() + ',' + lng2.toString();
      var fields = [];
      var nullFields = [];
      for (var i = 0; i <= 77; ++i) {
        fields.push(i);
        nullFields.push('h');
      }
      database.insertDirectionsData(city, latLng1, fields);
      database.insertDirectionsData(city, latLng2, nullFields);
      done();
    });

    after(function(done) {
      testDB.exec('DELETE FROM CommunityDirections WHERE ' +
          'lat=' + lat1 + ' OR lat=' + lat2);
      done();
    });

    function degToRad(deg) {
      return deg * Math.PI / 180;
    }

    it('should insert directions', function(done) {
      testDB.all('SELECT * FROM CommunityDirections WHERE ' +
          'lat=' + lat1, function(err, rows) {
        if (err) {
          done(err);
        } else {
          var radLat = degToRad(lat1);
          var radLng = degToRad(lng1);
          rows.should.have.length(1);
          rows[0].lat.should.equal(lat1);
          rows[0].lng.should.equal(lng1);
          rows[0].sinLat.should.equal(Math.sin(radLat));
          rows[0].cosLat.should.equal(Math.cos(radLat));
          rows[0].sinLng.should.equal(Math.sin(radLng));
          rows[0].cosLng.should.equal(Math.cos(radLng));
          for (var key in rows[0]) {
            if (rows[0].hasOwnProperty(key) && !isNaN(key)) {
              rows[0][key].should.equal(parseInt(key));
            }
          }
          done();
        }
      });
    });

    it('should change any non-numbers to "NULL"', function(done) {
      testDB.all('SELECT * FROM CommunityDirections WHERE ' +
          'lat=' + lat2, function(err, rows) {
        if (err) {
          done(err);
        } else {
          var radLat = degToRad(lat2);
          var radLng = degToRad(lng2);
          rows.should.have.length(1);
          rows[0].lat.should.equal(lat2);
          rows[0].lng.should.equal(lng2);
          rows[0].sinLat.should.equal(Math.sin(radLat));
          rows[0].cosLat.should.equal(Math.cos(radLat));
          rows[0].sinLng.should.equal(Math.sin(radLng));
          rows[0].cosLng.should.equal(Math.cos(radLng));
          for (var key in rows[0]) {
            if (rows[0].hasOwnProperty(key) && !isNaN(key)) {
              console.assert(rows[0][key] === null);
            }
          }
          done();
        }
      });
    });
  });

  describe('insertAllDirectionsData', function() {
    var lat1 = 81.3;
    var lng1 = -23.4;
    var lat2 = 12.2;
    var lng2 = -34.6;

    before(function(done) {
      var latLng1 = lat1.toString() + ',' + lng1.toString();
      var latLng2 = lat2.toString() + ',' + lng2.toString();
      var fields = [];
      var nullFields = [];
      for (var i = 0; i <= 77; ++i) {
        fields.push(i);
        nullFields.push('h');
      }
      var latLngs = {};
      latLngs[latLng1] = fields;
      latLngs[latLng2] = nullFields;
      database.insertAllDirectionsData(city, latLngs);
      setTimeout(done, 1);
    });

    after(function(done) {
      testDB.exec('DELETE FROM CommunityDirections WHERE ' +
        'lat=' + lat1 + ' OR lat=' + lat2);
      done();
    });

    it('should insert all directions', function(done) {
      testDB.all('SELECT * FROM CommunityDirections', function(err, rows) {
        if (err) {
          done(err);
        } else {
          rows.should.have.length(2);
          rows[0].lat.should.equal(lat1);
          rows[0].lng.should.equal(lng1);
          rows[1].lat.should.equal(lat2);
          rows[1].lng.should.equal(lng2);
          done();
        }
      });
    });
  });

  describe('insertCommunityArea', function() {
    var community = {
      communityID: 12,
      name: 'aaa',
      landArea: 12,
      center: '123',
      truliaID: 13,
      radius: 123,
      outline: [{lat: 1, lng: 2}]
    };

    var communityNull = {
      communityID: 13,
      name: 'bbb',
      landArea: 234,
      center: '123',
      truliaID: 5645,
      radius: 'abc',
      outline: undefined
    };

    before(function(done) {
      database.insertCommunityArea(city, community.communityID, community);
      database.insertCommunityArea(city, communityNull.communityID,
          communityNull);
      done();
    });

    after(function(done) {
      testDB.exec('DELETE FROM CommunityArea WHERE communityID=12 OR ' +
          'communityID=13');
      done();
    });

    it('should insert community area', function(done) {
      testDB.get('SELECT * FROM CommunityArea WHERE communityID=12',
          function(err, row) {
        if (err) {
          done(err);
        } else {
          for (var key in row) {
            if (row.hasOwnProperty(key)) {
              if (key !== 'outline') {
                row[key].should.equal(community[key]);
              }
            }
          }
          row.outline.should.equal(JSON.stringify(community.outline));
          done();
        }
      });
    });

    it('should change incorrect values to "NULL"', function(done) {
      testDB.get('SELECT * FROM CommunityArea WHERE communityID=13',
          function(err, row) {
        if (err) {
          done(err);
        } else {
          row.radius.should.equal('NULL');
          row.outline.should.equal('NULL');
          done();
        }
      });
    });
  });

  describe('insertAllCommunityAreas', function() {
    var community = {
      communityID: 14,
      name: 'aaa',
      landArea: 12,
      center: '123',
      truliaID: 13,
      radius: 123,
      outline: [{lat: 1, lng: 2}]
    };

    var communityNull = {
      communityID: 15,
      name: 'bbb',
      landArea: 234,
      center: '123',
      truliaID: 5645,
      radius: 'abc',
      outline: undefined
    };

    var communities = {};

    before(function(done) {
      communities[community.communityID] = community;
      communities[communityNull.communityID] = communityNull;
      database.insertAllCommunityAreas(city, communities);
      setTimeout(done, 1);
    });

    after(function(done) {
      testDB.exec('DELETE FROM CommunityArea WHERE communityID=14 OR ' +
        'communityID=15');
      done();
    });

    it('should insert all community areas', function(done) {
      testDB.all('SELECT * FROM CommunityArea', function(err, rows) {
        if (err) {
          done(err);
        } else {
          rows.should.have.length(2);
          rows[0].communityID.should.equal(community.communityID);
          rows[1].communityID.should.equal(communityNull.communityID);
          done();
        }
      })
    });
  });

  describe('getClosestLatLng', function() {
    var lat1 = 81;
    var lat2 = 100;
    var closeLatLng = lat1.toString() + ',-23';
    var farLatLng = lat2.toString() + ',-1';
    var destLatLng = {lat: 82, lng: -22};

    before(function(done) {
      var fields = [];
      for (var i = 0; i <= 77; ++i) {
        fields.push(i);
      }
      var latLngs = {};
      latLngs[closeLatLng] = fields;
      latLngs[farLatLng] = fields;
      database.insertAllDirectionsData(city, latLngs);
      setTimeout(done, 0.00000000000001);
    });

    after(function(done) {
      testDB.exec('DELETE FROM CommunityDirections WHERE ' +
          'lat=' + lat1 + ' OR lat=' + lat2);
      done();
    });

    it('should return closer coordinate', function(done) {
      database.getClosestLatLng(city, destLatLng, function(err, row) {
        if (err) {
          done(err);
        } else {
          row.lat.should.equal(lat1);
          row.lng.should.equal(-23);
          done();
        }
      });
    })
  });

  describe('getCommunitiesCondition', function() {
    var communitiesArea = {
      16: {
        name: 'aaa', landArea: 12, center: '123', truliaID: 16, radius: 123,
        outline: [{lat: 1, lng: 2}]
      },
      17: {
        name: 'aaa', landArea: 12, center: '123', truliaID: 17, radius: 124,
        outline: [{lat: 1, lng: 2}]
      },
      18: {
        name: 'aaa', landArea: 12, center: '123', truliaID: 18, radius: 125,
        outline: [{lat: 1, lng: 2}]
      }
    };

    var communitiesData = {
      16: {
        violentCrimePctOfAvg: 'apple', nonViolentCrimePctOfAvg: undefined,
        nightlifePctOfAvg: 0.4, crowdedPctOfAvg: 0.2, pricePctOfAvg: 0.7
      },
      17: {
        violentCrimePctOfAvg: 0.3, nonViolentCrimePctOfAvg: 0.4,
        nightlifePctOfAvg: 0.1, crowdedPctOfAvg: 0.9, pricePctOfAvg: 'hello'
      },
      18: {
        violentCrimePctOfAvg: 0.8, nonViolentCrimePctOfAvg: 0.2,
        nightlifePctOfAvg: 0.9, crowdedPctOfAvg: 0.3, pricePctOfAvg: 0.1
      }
    };

    before(function(done) {
      database.insertAllCommunityAreas(city, communitiesArea);
      database.insertAllCommunitiesData(city, communitiesData);
      // for some reason this makes everything work idk
      setTimeout(done, 1);
    });

    after(function(done) {
      testDB.exec('DELETE FROM CommunityData WHERE communityID=16 OR ' +
        'communityID=17 OR communityID=18');
      done();
    });

    it('should return all communities that match a condition', function(done) {
      database.getCommunitiesCondition(city, 'nightlifePctOfAvg<0.5',
          function(err, rows) {
        if (err) {
          done(err);
        } else {
          rows.should.have.length(2);
          rows[0].communityID.should.equal(16);
          rows[1].communityID.should.equal(17);
          done();
        }
      });
    });
  });
});

describe('Directions', function() {
  var directions = require('../lib/directions');
  var city = 'CHICAGO';

  describe.skip('getTimeToCommunities', function() {
    it('should return time from coordinate to all communities',
        function(done) {
      var communities = [
        {
          communityID: 1,
          latLng: '36.153128,-86.801081'
        },
        {
          communityID: 2,
          latLng: '36.139146,-86.829458'
        }
      ];
      var drivingPreferences = {
        mode: 'driving',
        destination: '36.152035,-86.809247'
      };
      directions.getTimeToCommunities(city, communities, drivingPreferences,
          function(err, result) {
        if (err) {
          done(err);
        } else {
          result[1].should.equal(4.15);
          result[2].should.equal(7.716666666666667);
          done();
        }
      });
    });
  });
});

describe('DirectionsCommunities', function() {
  var directionsCommunities = require('../lib/directionsCommunities');
  var city = 'CHICAGO';

  describe.skip('getTimeToCommunities', function() {
    it('should get time to all communities', function(done) {
      var drivingPreferences = {
        mode: 'driving',
        destination: '36.152035,-86.809247'
      };
      directionsCommunities.getTimeToCommunities(city, drivingPreferences,
          function(err, result) {
        if (err) {
          done(err);
        } else {
          var communities = {};
          for (var i = 1; i <= 77; ++i) {
            communities[i] = false;
          }
          for (var key in result) {
            if (result.hasOwnProperty(key)) {
              communities[key] = true;
            }
          }
          for (var id in communities) {
            if (communities.hasOwnProperty(id)) {
              communities[id].should.equal(true);
            }
          }
          done();
        }
      });
    });
  });

  describe.skip('getClosestLatLng', function() {
    it('should get closest latLng to destination', function(done) {
      var lat = 81;
      var lng = -23;
      var latLng = lat.toString() + ',' + lng.toString();
      directionsCommunities.getClosestLatLng(city, latLng,
          function(err, result) {
        if (err) {
          done(err);
        } else {
          // check result when we finish populating directions
          done('check result when we finish populating directions');
        }
      });
    });
  });
});

describe('MakeRequest', function() {
  var makeRequest = require('../lib/makeRequest');

  it('should make a request', function(done) {
    makeRequest('http://example.com', null, function(err, result) {
      if (err) {
        done(err);
      } else {
        console.assert(err === null);
        result.should.not.be.equal(null);
        done();
      }
    });
  });

  it('should give an error for bad requests', function(done) {
    makeRequest('http://example.com/foo', null, function(err, result) {
      console.assert(result === undefined);
      err.toString().should.be.equal(new Error('Response Code:404').toString());
      done();
    });
  });
});

describe('Nightlife', function() {
  var nightlife = require('../lib/nightlife');


});

describe('TribuneData', function() {
  var tribune = rewire('../lib/tribuneData');

  describe.skip('getAllCommunityData', function() {
    it('should return an object with all expected keys', function(done) {
      tribune.getAllCommunityData(1, function(err, obj) {
        if (err) {
          done(err);
        } else {
          obj.should.have.all.keys('adjacent_area_numbers', 'area_number',
            'hardship_index', 'name', 'pct_crowded', 'pct_no_diploma',
            'pct_old_and_young', 'pct_poverty', 'pct_unemployed',
            'per_capita_income', 'population_2000', 'population_2010',
            'shape_area', 'shape_len', 'slug', 'wikipedia');
          done();
        }
      });
    });
  });

  describe('getCrowdedPct', function() {
    var getCrowdedPct = tribune.__get__('getCrowdedPct');
    var reset;
    before(function() {
      reset = tribune.__set__('getAllCommunityData', function(ignore, cb) {
        // Create dummy object to pass back
        var retObj = {
          adjacent_area_numbers: '5',
          area_number: '2',
          hardship_index: '0.7',
          name: 'Loop',
          pct_crowded: '0.6',
          pct_no_diploma: '0.7',
          pct_old_and_young: '0.43',
          pct_poverty: '0.2'
        };
        cb(null, retObj);
      });
    });
    after(function() {
      reset();
    });

    it('should return only pct_crowded as a number', function(done) {
      getCrowdedPct({ communityID: 1 }, function(err, num) {
        if (err) {
          done(err);
        } else {
          num.should.be.a('number');
          num.should.not.be.NaN;
          done();
        }
      });
    });
  });

  describe('getCrimeCount', function() {
    var getCrimeCount = tribune.__get__('getCrimeCount');

    it('should pass the correct parameters to makeRequest', function(done) {
      // NOTE: month is 0-based for the Date constructor
      var clock = sinon.useFakeTimers(new Date(1993, 9, 30).getTime());
      var revert = tribune.__set__('makeRequest', function(url, params, cb) {
        params.should.contain.all.keys('community_area', 'limit',
          'crime_date__gte', 'format');
        params.community_area.should.equal(1);
        params.limit.should.equal(0);
        params.crime_date__gte.should.equal('1993-04-30');
        params.format.should.equal('json');
        clock.restore();
        revert();
        done();
      });
      getCrimeCount({ communityID: 1 }, function() {});
    });

    it.skip('should return an object with violent and non-violent crime',
      function(done) {
        this.timeout(3000);
        getCrimeCount({ communityID: 1, landArea: 1800 },
          function(err, obj) {
            if (err) {
              done(err);
            } else {
              obj.should.contain.all.keys('violent', 'nonViolent');
              obj.violent.should.be.a('number');
              obj.violent.should.not.be.NaN;
              obj.violent.should.be.greaterThan(0);
              obj.nonViolent.should.be.a('number');
              obj.nonViolent.should.not.be.NaN;
              obj.nonViolent.should.be.greaterThan(0);
              done();
            }
          });
      });
  });

  describe('communitiesCrimePctOfAvg', function() {
    var fakeCommInfo = [
      { communityID: 1,
        landArea: 8000 },
      { communityID: 2,
        landArea: 8000}
    ];

    // Create variable to restore getCrimeCount
    var reset;
    before(function() {
      reset = tribune.__set__('getCrimeCount', function(ignore, cb) {
        cb(null, { violent: 0.5, nonViolent: 0.75 });
      });
    });
    after(function() {
      reset();
    });

    it('should return pctOfAvg for violent and non-violent crime',
      function(done) {
        tribune.communitiesCrimePctOfAvg(fakeCommInfo,
          function(err, violent, nonViolent) {
            if (err) {
              done(err);
            } else {
              var violentSum = 0;
              for (var vcommunity in violent) {
                if (violent.hasOwnProperty(vcommunity)) {
                  violent[vcommunity].should.be.a('number');
                  violent[vcommunity].should.not.be.NaN;
                  violentSum += violent[vcommunity];
                }
              }
              violentSum.should.equal(fakeCommInfo.length);
              var nonViolentSum = 0;
              for (var community in nonViolent) {
                if (nonViolent.hasOwnProperty(community)) {
                  nonViolent[community].should.be.a('number');
                  nonViolent[community].should.not.be.NaN;
                  nonViolentSum += nonViolent[community];
                }
              }
              nonViolentSum.should.equal(fakeCommInfo.length);
              done();
            }
          });
      });
  });
});

describe('TruliaData', function() {
  var trulia = rewire('../lib/truliaData');

  describe('generateParams', function() {
    var generateParams = trulia.__get__('generateParams');

    var clock;
    before(function() {
      // Mock all date/time functions so we can easily test output
      // NOTE: month is 0-based for the Date constructor
      clock = sinon.useFakeTimers(new Date(1993, 9, 30).getTime());
    });
    after(function() {
      clock.restore();
    });

    it('should calculate/format dates for today and 6 months ago', function() {
      var retObj = generateParams({ truliaID: 6 });
      retObj.startDate.should.equal('1993-04-30');
      retObj.endDate.should.equal('1993-10-30');
    });
  });

  describe('getAveragePriceFromArr', function() {
    var getAveragePriceFromArr = trulia.__get__('getAveragePriceFromArr');
    var fakeXML = `<TruliaWebServices>
                    <response>
                      <TruliaStats>
                        <listingStats>
                          <listingStat>
                            <listingPrice>
                              <subcategory>
                                <type>All Properties</type>
                                <medianListingPrice>192088</medianListingPrice>
                              </subcategory>
                              <subcategory>
                                <type>1 Bedroom Properties</type>
                                <medianListingPrice>153057</medianListingPrice>
                              </subcategory>
                            </listingPrice>
                          </listingStat>
                          <listingStat>
                            <listingPrice>
                              <subcategory>
                                <type>All Properties</type>
                                <medianListingPrice>199300</medianListingPrice>
                              </subcategory>
                              <subcategory>
                                <type>1 Bedroom Properties</type>
                                <medianListingPrice>153057</medianListingPrice>
                              </subcategory>
                            </listingPrice>
                          </listingStat>
                          <listingStat>
                            <listingPrice>
                              <subcategory>
                                <type>All Properties</type>
                                <medianListingPrice>239900</medianListingPrice>
                              </subcategory>
                              <subcategory>
                                <type>1 Bedroom Properties</type>
                                <medianListingPrice>163450</medianListingPrice>
                              </subcategory>
                              <subcategory>
                                <type>1 Bedroom Properties</type>
                                <medianListingPrice>159000</medianListingPrice>
                              </subcategory>
                            </listingPrice>
                          </listingStat>
                        </listingStats>
                      </TruliaStats>
                    </response>
                    </TruliaWebServices>`;
    it('should parse XML and return the correct average', function(done) {
      getAveragePriceFromArr(fakeXML, function(err, result) {
        if (err) {
          done(err);
        } else {
          var properAvg = (153057 + 153057 + 163450) / 3;
          result.should.equal(properAvg);
          done();
        }
      });
    });
  });
});
