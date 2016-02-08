app.controller('mapController', function($scope, $location) {
    var s = document.getElementById('map');
    var map = new google.maps.Map(document.getElementById('map'), {
            center: {lat: 41.8369, lng: -87.6847},
            zoom: 12
        });
});