var chai = require('chai');
var should = chai.should();

describe('TribuneData', function() {
  var tribune = require('../lib/tribuneData');

  describe('getYearCrimeCount', function() {
    it('should return a number', function(done) {
      tribune.getYearCrimeCount(1, 2016, function(err, num) {
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
