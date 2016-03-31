/**
 * Created by chrissu on 2/15/16.
 */
app.service('communityDataService', function($resource, $http) {

    var params = {
        safety: '2',
        qualityOfLife: '2',
        nightlife: '2',
        affordability: '2',
        breathingRoom: '2',
        city: 'Chicago'
    };


    var setFilters = function(questionKey, selectedVal) {
        params[questionKey] = selectedVal.toString();
    };

    var setCity = function(city) {
        params.city = city;
    }

    var preferences = function () {
        return $.get('/preferences', params, function (data) {
            return data;
        });
    };

    return {
        preferences : preferences,
        setFilters : setFilters,
        setCity : setCity
    };
});