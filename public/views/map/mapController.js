app.controller('mapController', function($scope, $stateParams, communityDataService) {

    //Obtain lat and lng for searched city
    var lat = parseFloat($stateParams.lat),
        lng = parseFloat($stateParams.lng);

    //Hard code bound for Chicago
    var NW = {lat: 41.9786, lng: -87.9047},
        SE = {lat: 41.6600, lng: -87.5500};

    var bounds = new google.maps.LatLngBounds(NW, SE);
    var center = bounds.getCenter();

    var selectedColors = ['#1A3750', '#fbb450', '#0000FF', '#ee5f5b', '#61304B', '#428BCA'];

    $scope.preferences = [];

    //Populate map with preferences from database
    $scope.setPreferences = function() {
        communityDataService.preferences()
            .done(function (result) {
                for (var i = 0; i < 10; i++) {
                    $scope.preferences.push(result[i]);
                    $scope.preferences[i].isCollapsed = true;
                    $scope.preferences[i].selectedColor = selectedColors[i];
                }
                $scope.$apply();

                $scope.mapPreferences();
            })
            .fail(function () {
                console.log("Unable to retrieve preferences");
            });

    };

    //Map the preferred neighborhoods
    $scope.mapPreferences = function() {
        $scope.circles = [];

        for (var i = 0; i < $scope.preferences.length; i++) {

            var center = $scope.preferences[i].latLng.split(",");
            center = {lat: parseFloat(center[0]), lng: parseFloat(center[1])};

            var circle = new google.maps.Circle({
                strokeOpacity : 0,
                fillColor: $scope.preferences[i].selectedColor,
                fillOpacity: .9,
                map: $scope.map,
                center: center,
                radius: $scope.preferences[i].radius,
                name: $scope.preferences[i].name,
                prefIndex: i
            });
            $scope.circles.push(circle);

            google.maps.event.addListener(circle, 'click', function (event) {
                $scope.preferences[this.prefIndex].isCollapsed = !$scope.preferences[this.prefIndex].isCollapsed;
                $scope.$apply();
            });

        }
    };

    angular.element(document).ready(function () {
        $scope.map = new google.maps.Map(document.getElementById('map'), {
            disableDefaultUI: true,
            center: {lat: center.lat(), lng: center.lng()},
            zoom: 8,
            scaleControl: false
        });

        $scope.map.fitBounds(bounds);
        google.maps.event.trigger($scope.map, 'resize');
        $scope.setPreferences();
    });

    $scope.details = function (index) {
        google.maps.event.trigger($scope.circles[index], 'click', function (event) {
        });
    };
});