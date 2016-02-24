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

    $scope.preferences = [];
    //Populate map with preferences from database
    communityDataService.preferences()
        .done(function(result){
            for (var i = 0; i < 5; i++){
                $scope.preferences.push(result[i]);
                $scope.preferences[i].isCollapsed = true;
            }
            $scope.$apply();
            mapPreferences();
        })
        .fail(function(){
            console.log("Unable to retrieve preferences");
        });

    var mapPreferences = function(){

        var infoWindow = new google.maps.InfoWindow();

        for (var i = 0; i < $scope.preferences.length; i++) {

            var center = $scope.preferences[i].latLng.split(",");
            center = { lat: parseFloat(center[0]), lng: parseFloat(center[1])};

            var circle = new google.maps.Circle({
                strokeOpacity: 0,
                fillColor: '#428BCA',
                fillOpacity: 0.2 + (0.1 * i),
                map: map,
                center: center,
                radius: $scope.preferences[i].radius,
                name: $scope.preferences[i].name
            });

            google.maps.event.addListener(circle, 'click', function(event) {
                this.setOptions({fillColor: '#00d39e'});
                infoWindow.setContent("<b>" + this.name + "</b>");
                infoWindow.setPosition(this.center);
                infoWindow.open(map);
            });
        }
    };
});