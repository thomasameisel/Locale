app.controller('mapController', function($scope, $stateParams) {
    var lat = parseFloat($stateParams.lat),
        lng = parseFloat($stateParams.lng);

    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: lat, lng: lng},
        zoom: 12,
        disableDefaultUI: true
    });

    google.maps.event.trigger(map , 'resize');

    var coordinates = [
        {lat: 41.881832, lng: -87.623177},
        {lat: 41.891832, lng: -87.6545},
        {lat: 41.911832, lng: -87.7237},
        {lat: 41.821832, lng: -87.647}
    ];

    $scope.markers = [];

    coordinates.forEach(function (location) {
        $scope.markers.push(new google.maps.Marker({
            position: location,
            map: map,
            title: 'Apartment'
        }));
    });

});