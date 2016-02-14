// Prevent jshint from complaining about `should.be.NaN`
// jshint expr:true
var rewire = require('rewire');
var chai = require('chai');
var should = chai.should();
var sinon = require('sinon');
chai.use(require('sinon-chai'));

describe('TribuneData', function() {
  var tribune = rewire('../lib/tribuneData');

  describe('getAllCommunityData', function() {
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

  describe.skip('getCrimeCount', function() {
    var getCrimeCount = tribune.__get__('getCrimeCount');
    it('should return an object with violent and non-violent crime',
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

describe('CommunitiesPctOfAvg', function() {
  var pctOfAvg = rewire('../lib/communitiesPctOfAvg');

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
});
