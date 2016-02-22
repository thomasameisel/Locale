app.controller('mapController', function($scope, $stateParams, communityDataService) {
    //Obtain lat and lng for searched city
    var lat = parseFloat($stateParams.lat),
        lng = parseFloat($stateParams.lng);

    //Hard code bound for Chicago
    var NW = {lat: 41.9786, lng: -87.9047},
        SE = {lat: 41.6600, lng: -87.5500};

    var bounds = new google.maps.LatLngBounds(NW, SE);
    var center = bounds.getCenter();

    var map = new google.maps.Map(document.getElementById('map'), {
        disableDefaultUI: true,
        center : {lat: center.lat(), lng: center.lng()},
        zoom: 8,
        scaleControl: false
    });

    map.fitBounds(bounds);


    //Populate map with preferences from database
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

        var infoWindow = new google.maps.InfoWindow();

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
                radius: preferences[i].radius,
                name: preferences[i].name
            });

            //attachName(circle, center, preferences[i].name);

            google.maps.event.addListener(circle, 'click', function(event) {
                infoWindow.setContent(this.name);
                infoWindow.setPosition(this.center);
                infoWindow.open(map);
            });
        }
    };

});