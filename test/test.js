// Prevent jshint from complaining about `should.be.NaN`
// jshint expr:true
var rewire = require('rewire');
var chai = require('chai');
var should = chai.should();
// var sinon = require('sinon');
// var sinonChai = require('sinon-chai');
// chai.use(sinonChai);

describe('TribuneData', function() {
  var tribune = rewire('../lib/tribuneData');

  describe('getCrimeCount', function() {
    it('should return an object with violent and non-violent crime',
        function(done) {
      this.timeout(3000);
      tribune.getCrimeCount({ communityID: 1, landArea: 1800 },
          function(err, obj) {
        if (err) {
          done(err);
        } else {
          obj.should.contain.all.keys('violent', 'nonViolent');
          obj.violent.should.be.a('number');
          obj.violent.should.not.be.NaN;
          obj.nonViolent.should.be.a('number');
          obj.nonViolent.should.not.be.NaN;
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

  describe('getCrowdedPct', function() {
    it('should return a number', function(done) {
      tribune.getCrowdedPct({ communityID: 1 }, function(err, num) {
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
});
