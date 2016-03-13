/**
 * Created by chrissu on 2/15/16.
 */
app.service('directionsDataService', function($resource, $http) {

    var directions = function (params) {
        return $.get('/directions', params, function (result) {
            return result;
        });
    };

    return {
        directions : directions
    };
});