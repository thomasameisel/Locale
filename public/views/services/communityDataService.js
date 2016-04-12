/**
 * Created by chrissu on 2/15/16.
 */
app.service('communityDataService', function($resource, $http) {

    var params = {
        safety: '',
        qualityOfLife: '',
        nightlife: '',
        affordability: '',
        breathingRoom: '',
        city: ''
    };


    var setFilters = function(questionKey, selectedVal) {
        params[questionKey] = selectedVal.toString();
    };

    var setCity = function(city) {
        params.city = city;
    };

    var getCity = function(){
        return params.city;
    };

    var preferences = function () {
        return $.get('/preferences', params, function (data) {
            return data;
        });
    };

    var resetParams = function(changeCity){
        for (var key in params) {
            if (params.hasOwnProperty(key) && key != 'city') {
                params[key] = '';
            }
        }
        if (changeCity){
            params['city'] = '';
        }
    };

    return {
        preferences : preferences,
        setFilters : setFilters,
        setCity : setCity,
        getCity : getCity,
        resetParams : resetParams
    };
});