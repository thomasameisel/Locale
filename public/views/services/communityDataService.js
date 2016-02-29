/**
 * Created by chrissu on 2/15/16.
 */
app.factory('communityDataService', function($resource, $http) {

    var params = {
        safety: '4',
        qualityOfLife: '3',
        nightlife: '4',
        affordability: '4',
        breathingRoom: '2'
    };


    var setFilters = function(questionKey, selectedVal) {
        params[questionKey] = selectedVal.toString();
    };

    var preferences = function (result) {
        return $.get('/preferences', params, function (data) {
            return result;
        });
    };

    return {
        preferences : preferences,
        setFilters : setFilters
    };
});