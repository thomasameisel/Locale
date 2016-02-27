app.controller('mapController', function($scope, $stateParams, communityDataService) {

    //Obtain lat and lng for searched city
    var lat = parseFloat($stateParams.lat),
        lng = parseFloat($stateParams.lng);

    $scope.categories = {
        violentCrimePctOfAvg    :   'Violent Crime',
        nonViolentCrimePctOfAvg :   'Nonviolent Crime',
        nightlifePctOfAvg       :   'Nightlife',
        pricePctOfAvg           :   'Price',
        crowdedPctOfAvg         :   'Crowded'
    };

    $scope.preferences = [];
    $scope.showDetail = false;

    //Populate map with preferences from database
    $scope.setPreferences = function() {
        communityDataService.preferences()
            .done(function (result) {
                for (var i = 0; i < 10; i++) {
                    $scope.preferences.push(result[i]);
                }
                $scope.safeApply();

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
            center = { lat: parseFloat(center[0]), lng: parseFloat(center[1])};

            var circle = new google.maps.Circle({
                strokeOpacity : 0,
                fillColor: '#428BCA',
                fillOpacity: .9 - (.1 * i),
                map: $scope.map,
                center: center,
                radius: $scope.preferences[i].radius,
                name: $scope.preferences[i].name,
                prefIndex: i
            });
            $scope.circles.push(circle);

            google.maps.event.addListener(circle, 'click', function (event) {
                $scope.selectedPreference = $scope.preferences[this.prefIndex];
                $scope.showDetail = true;

                $scope.map.fitBounds(this.getBounds());
                google.maps.event.trigger($scope.map, 'resize');

                $scope.safeApply();
            });

        }
    };


    //Hard code bound for Chicago
    var NW = {lat: 41.9786, lng: -87.9047},
        SE = {lat: 41.6600, lng: -87.5500};

    var defaultBounds = new google.maps.LatLngBounds(NW, SE);
    var defaultCenter = defaultBounds.getCenter();

    angular.element(document).ready(function () {
        $scope.map = new google.maps.Map(document.getElementById('map'), {
            disableDefaultUI: true,
            center: {lat: defaultCenter.lat(), lng: defaultCenter.lng()},
            zoom: 8,
            scaleControl: false
        });

        $scope.map.fitBounds(defaultBounds);
        google.maps.event.trigger($scope.map, 'resize');
        $scope.setPreferences();
    });

    $scope.choose = function (index) {
        google.maps.event.trigger($scope.circles[index], 'click', function (event) {
        });
    };

    $scope.$on('return', function () {
        $scope.showDetail = false;
        $scope.map.fitBounds(defaultBounds);
        google.maps.event.trigger($scope.map, 'resize');
    });

    $scope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    $scope.getStars = function(n) {
        return new Array(n);
    };
});