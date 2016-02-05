var chai = require('chai');
var should = chai.should();

describe('TribuneData', function() {
  var tribune = require('../lib/tribuneData');

  describe('getCrimeCount', function() {
    it('should return a number', function(done) {
      tribune.getCrimeCount({ communityID: 1 }, function(err, num) {
        if(err) {
          done(err);
        } else {
          num.should.be.a('number');
          done();
        }
      });
    });

  });

  describe('getCrowdedPct', function() {
    it('should return a number', function(done) {
      tribune.getCrowdedPct({ communityID: 1 }, function(err, num) {
        if(err) {
          done(err);
        } else {
          num.should.be.a('number');
          done();
        }
      });
    });
  });
});
