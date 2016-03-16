app.controller('mapController', function($scope, $stateParams, communityDataService, directionsDataService) {

    //Obtain lat and lng for searched city
    var lat = parseFloat($stateParams.lat),
        lng = parseFloat($stateParams.lng);

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
        google.maps.event.addListenerOnce(map, 'idle', function() {
            google.maps.event.trigger(map, 'resize');
        });
        setPreferences();

        $scope.directionsService = new google.maps.DirectionsService();
        $scope.directionsDisplay = new google.maps.DirectionsRenderer();
        $scope.directionsDisplay.setMap($scope.map);
    });

    $scope.categories = {
        violentCrimePctOfAvg    :   'Violent Crime',
        nonViolentCrimePctOfAvg :   'Nonviolent Crime',
        nightlifePctOfAvg       :   'Nightlife',
        pricePctOfAvg           :   'Price',
        crowdedPctOfAvg         :   'Crowded'
    };

    $scope.preferences = [];
    $scope.showDetail = false;


    //Update communities when time limit changes
    $scope.$on('timeChange', function(ev){
        removeNeighborhoods();
        filterData();
        mapPreferences();
    });

    //Retrieve commute time for the communities
    var coordinatesInfo = directionsDataService.getCommunityTime();
    $scope.communityTimes = coordinatesInfo.communityTimes;
    $scope.timeLimit = coordinatesInfo.maxTime;


    //Populate map with preferences from database
    function setPreferences() {
        communityDataService.preferences()
            .done(function (result) {
                $scope.communityData = result;
                $scope.safeApply();
                filterData();
                mapPreferences();
            })
            .fail(function () {
                console.log("Unable to retrieve preferences");
            });

    };

    //Filter data based on time limit
    function filterData(){
        $scope.preferences = [];
        $scope.$apply();
        var count = 0;
        for (var i = 0; i < $scope.communityData.length && count < 10; ++i) {
          var time = $scope.communityTimes[$scope.communityData[i].communityID];
          if (time !== null && time <= $scope.timeLimit) {
            $scope.preferences.push($scope.communityData[i]);
            count++;
          }
        }
        $scope.safeApply();
    };

    //Remove neighborhoods
    function removeNeighborhoods(){
        for (var i =0 ; i< $scope.neighborhoods.length; i++){
            $scope.neighborhoods[i].setMap(null);
        }
        $scope.$apply();
    };


    //Map the preferred neighborhoods
    function mapPreferences() {
        $scope.neighborhoods = [];
        $scope.$apply();

        for (var i = 0; i < $scope.preferences.length; i++) {

            var preference = $scope.preferences[i];
            var bounds = new google.maps.LatLngBounds();

            for (var j =0; j < preference.outline.length; j++) {
                var xy = preference.outline[j];
                var point = new google.maps.LatLng({lat:xy.lat,lng:xy.lng});
                bounds.extend(point);
            }

            var neighborhood = new google.maps.Polygon({
                map             : $scope.map,
                paths           : preference.outline,
                fillColor       : '#2e618d',
                strokeOpacity   : 1,
                fillOpacity     : 0.9 - (0.05 * i),
                name            : preference.name,
                bounds          : bounds,
                prefIndex       : i
            });

            $scope.neighborhoods.push(neighborhood);

            google.maps.event.addListener(neighborhood, 'click', function (event) {
                $scope.selectedPreference = $scope.preferences[this.prefIndex];
                $scope.showDetail = true;

                //calcRoute($scope.preferences[this.prefIndex].bounds.getCenter());

                $scope.map.fitBounds(this.bounds);
                google.maps.event.addListenerOnce(map, 'idle', function() {
                    google.maps.event.trigger(map, 'resize');
                });
                $scope.safeApply();
            });

        }
    };


    $scope.choose = function (index) {
        google.maps.event.trigger($scope.neighborhoods[index], 'click', function (event) {
        });
    };

    $scope.$on('return', function () {
        returnToMainPanel();
    });

    function returnToMainPanel() {
        $scope.showDetail = false;
        $scope.map.fitBounds(defaultBounds);
        google.maps.event.addListenerOnce(map, 'idle', function() {
            google.maps.event.trigger(map, 'resize');
        });
    }


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


    function calcRoute(end) {
        var request = {
            origin:defaultCenter,
            destination:end,
            travelMode: google.maps.TravelMode.DRIVING
        };
        $scope.directionsService.route(request, function(result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                $scope.directionsDisplay.setDirections(result);
            }
        });
    }
});
