var chai = require('chai');
var should = chai.should();

describe('TribuneData', function() {
  var tribune = require('../lib/tribuneData');

  describe('getCrimeCount', function() {
    it('should return a number', function(done) {
      var dummyCommunity = { communityID: 1 };
      tribune.getCrimeCount(dummyCommunity, function(err, num) {
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
