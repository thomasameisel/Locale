app.controller('landingController', function($scope, $state, $stateParams, communityDataService) {
    /*var input = document.getElementById('searchBox1');
    //var searchBox = new google.maps.places.SearchBox(input);
    var autocomplete = new google.maps.places.Autocomplete(input, { types: ['(cities)']});

    var geocoder = new google.maps.Geocoder();


    $scope.search = function() {
        var address = document.getElementById('searchBox1').value;

        geocoder.geocode({'address': address}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                $state.go('questionnaire', {lng: results[0].geometry.location.lng(), lat : results[0].geometry.location.lat()});
            } else {
                $scope.error = status;
            }
        });
    };

    $scope.press = function (event) {
        if(event.which === 13) {
            $scope.search();
        }
    };*/
    $scope.update = function() {
        communityDataService.setCity($scope.data.singleSelect);
        $state.go('questionnaire', undefined);
    }
});