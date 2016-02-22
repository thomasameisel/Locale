app.controller('mapController', function($scope, $stateParams, communityDataService) {
    var lat = parseFloat($stateParams.lat),
        lng = parseFloat($stateParams.lng);

    var NW = {lat: 41.9786, lng: -87.9047},
        SE = {lat: 41.6600, lng: -87.5500};


    var bounds = new google.maps.LatLngBounds(NW, SE);
    var center = bounds.getCenter();

    var map = new google.maps.Map(document.getElementById('map'), {
        disableDefaultUI: true,
        center : {lat: center.lat(), lng: center.lng()},
        zoom: 8
    });

    map.fitBounds(bounds);

    var preferences = [];
    communityDataService.preferences()
        .done(function(result){
            preferences = result;
            mapPreferences(preferences);
        })
        .fail(function(){
            console.log("Unable to retrieve preferences");
        });

    var mapPreferences = function(preferences){
        for (var i = 0; i < 5 && i < preferences.length; i++) {
            var center = preferences[i].latLng.split(",");
            center = { lat: parseFloat(center[0]), lng: parseFloat(center[1])};

            var circle = new google.maps.Circle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.35,
                map: map,
                center: center,
                radius: preferences[i].radius
            });
        }
    };


    var coordinates = [
        NW, SE
    ];

    $scope.markers = [];

    coordinates.forEach(function (location) {
        $scope.markers.push(new google.maps.Marker({
            position: location,
            map: map
        }));
    });

});