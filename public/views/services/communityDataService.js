/**
 * Created by chrissu on 2/15/16.
 */
app.service('communityDataService', function($resource, $http) {

    var params = {
        violentCrime: '',
        nonViolentCrime: '',
        nightlife: '',
        price: '',
        crowded: ''
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