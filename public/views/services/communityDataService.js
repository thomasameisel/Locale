/**
 * Created by chrissu on 2/15/16.
 */
app.factory('communityDataService', function($resource, $http) {

    var params = {
        violentCrime: {op: '<', num: '4'},
        nonViolentCrime: {op: '<', num: '3'},
        nightlife: {op: '>', num: '4'},
        price: {op: '<', num: '4'},
        crowded: {op: '<', num: '2'}
    };


    var setFilters = function(questionKey, selectedVal) {
        params[questionKey]['num'] = selectedVal.toString();
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