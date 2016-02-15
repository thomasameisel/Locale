app.controller('landingController', function($scope, $state) {
    var input = document.getElementById('searchBox');
    var searchBox = new google.maps.places.SearchBox(input);

    var geocoder = new google.maps.Geocoder();


    $scope.search = function() {
        var address = document.getElementById('searchBox').value;

        geocoder.geocode({'address': address}, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
                $state.go('questionnaire', {lng: results[0].geometry.location.lng(), lat : results[0].geometry.location.lat()});
            } else {
                $scope.error = status;
            }
        });
    }
});