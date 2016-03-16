/**
 * Created by chrissu on 2/15/16.
 */
app.service('directionsDataService', function($resource, $http) {
    var timeDistance = [];

    var setWorkplace = function (params) {
        return $.get('/directions', params, function (result) {
            timeDistance = result;
        });
    };

    var getCommunityTime = function() {
        return timeDistance;
    };

    return {
        setWorkplace        :   setWorkplace,
        getCommunityTime    :   getCommunityTime
    };
});