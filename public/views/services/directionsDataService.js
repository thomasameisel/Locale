/**
 * Created by chrissu on 2/15/16.
 */
app.service('directionsDataService', function($resource, $http) {
    var timeDistance = {
        communityTimes : [],
        maxTime : 10
    };

    var setTimeLimit = function(timeLimit){
        timeDistance.maxTime = timeLimit;
    };

    var setWorkplace = function (params) {
        return $.get('/directions', params, function (result) {
            timeDistance.communityTimes = result;
        });
    };

    var getCommunityTime = function() {
        return timeDistance;
    };

    var getTimeLimit = function() {
        return timeDistance.maxTime;
    };

    return {
        setWorkplace        :   setWorkplace,
        getCommunityTime    :   getCommunityTime,
        setTimeLimit        :   setTimeLimit,
        getTimeLimit        :   getTimeLimit
    };
});