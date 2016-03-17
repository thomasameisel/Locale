app.controller('mapController', function($scope, $stateParams, communityDataService, directionsDataService) {

    //Obtain lat and lng for searched city
    var lat = parseFloat($stateParams.lat),
        lng = parseFloat($stateParams.lng);

    //Hard code bound for Chicago
    var NW = {lat: 41.9786, lng: -87.9047},
        SE = {lat: 41.6600, lng: -87.5500};

    var defaultBounds = new google.maps.LatLngBounds(NW, SE);
    var defaultCenter = defaultBounds.getCenter();

    var colors = [ "#771155", "#AA4488", "#CC99BB", "#114477",
        "#4477AA", "#77AADD", "#117777", "#44AAAA", "#77CCCC", "#117744",
        "#44AA77", "#88CCAA", "#777711", "#AAAA44", "#DDDD77", "#774411",
        "#AA7744", "#DDAA77", "#771122", "#AA4455", "#DD7788" ];

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
        violentCrimePctOfAvg    :   'Safety',
        nonViolentCrimePctOfAvg :   'Quality of Life',
        nightlifePctOfAvg       :   'Nightlife',
        pricePctOfAvg           :   'Affordability',
        crowdedPctOfAvg         :   'Breathing Room'
    };

    $scope.preferences = [];
    $scope.preferencesObj = {};
    $scope.neighborhoods = {};
    $scope.showDetail = false;

    //Update communities when time limit changes
    $scope.$on('timeChange', function(ev){
        filterData();
        var remove = [];
        for (var id in $scope.neighborhoods) {
            if ($scope.neighborhoods.hasOwnProperty(id) &&
                    !$scope.preferencesObj[id]) {
                remove.push($scope.neighborhoods[id]);
                delete $scope.neighborhoods[id];
            }
        }
        var add = [];
        for (var i = 0; i < $scope.preferences.length; ++i) {
            if (!$scope.neighborhoods[$scope.preferences[i].communityID]) {
                add.push($scope.preferences[i]);
            }
        }
        removeNeighborhoods(remove);
        mapPreferences(add);
    });

    //Retrieve commute time for the communities
    var coordinatesInfo = directionsDataService.getCommunityTime();
    $scope.communityTimes = coordinatesInfo.communityTimes;
    $scope.timeLimit = coordinatesInfo.maxTime;

    function addColors(result) {
        for (var i = 0; i < result.length; ++i) {
            result[i].color = colors[i % colors.length];
        }
        return result;
    }

    function invertResult(result) {
        for (var i = 0; i < result.length; ++i) {
            for (var goodCriteria in result[i].goodCriteria) {
                if (result[i].goodCriteria.hasOwnProperty(goodCriteria) &&
                    goodCriteria !== 'nightlifePctOfAvg') {
                    var inverse = 2 - result[i].goodCriteria[goodCriteria];
                    result[i].goodCriteria[goodCriteria] = (inverse < 0) ?
                        0.05 : inverse;
                }
            }
            for (var badCriteria in result[i].badCriteria) {
                if (result[i].badCriteria.hasOwnProperty(badCriteria) &&
                    badCriteria !== 'nightlifePctOfAvg') {
                    var inverse = 2 - result[i].badCriteria[badCriteria];
                    result[i].badCriteria[badCriteria] = (inverse < 0) ?
                        0.05 : inverse;
                }
            }
        }
        return result;
    }

    //Populate map with preferences from database
    function setPreferences() {
        communityDataService.preferences()
            .done(function (result) {
                var invertedResult = invertResult(result);
                $scope.communityData = addColors(invertedResult);
                $scope.safeApply();
                filterData();
                mapPreferences($scope.preferences);
            })
            .fail(function () {
                console.error("Unable to retrieve preferences");
            });

    };

    //Filter data based on time limit
    function filterData(){
        $scope.preferences = [];
        $scope.preferencesObj = {};
        $scope.$apply();
        var count = 0;
        for (var i = 0; i < $scope.communityData.length && count < 10; ++i) {
            var time = $scope.communityTimes[$scope.communityData[i].communityID];
            if (time !== null && time <= $scope.timeLimit) {
                $scope.preferences.push($scope.communityData[i]);
                $scope.preferencesObj[$scope.communityData[i].communityID] = true;
                count++;
            }
        }
        $scope.safeApply();
    };

    //Remove neighborhoods
    function removeNeighborhoods(communities){
        for (var id in communities) {
            if (communities.hasOwnProperty(id)) {
                communities[id].setMap(null);
            }
        }
        $scope.$apply();
    };


    //Map the preferred neighborhoods
    function mapPreferences(communities) {
        $scope.$apply();

        for (var i = 0; i < communities.length; i++) {

            var preference = communities[i];

            var neighborhood = new google.maps.Polygon({
                map             : $scope.map,
                paths           : preference.outline,
                fillColor       : preference.color,
                strokeOpacity   : 1,
                fillOpacity     : 0.9,
                name            : preference.name,
                prefIndex       : i
            });

            $scope.neighborhoods[preference.communityID] = neighborhood;

            google.maps.event.addListener(neighborhood, 'click', function (event) {
                $scope.selectedPreference = communities[this.prefIndex];
                $scope.showDetail = true;

                //calcRoute($scope.preferences[this.prefIndex].bounds.getCenter());

                var bounds = new google.maps.LatLngBounds();

                for (var j =0; j < $scope.selectedPreference.outline.length; j++) {
                    var point = new google.maps.LatLng($scope.selectedPreference.outline[j]);
                    bounds.extend(point);
                }

                $scope.map.fitBounds(bounds);
                google.maps.event.addListenerOnce(map, 'idle', function() {
                    google.maps.event.trigger(map, 'resize');
                });
                $scope.safeApply();
            });

        }
    };


    $scope.choose = function (index) {
        var id = $scope.preferences[index].communityID;
        google.maps.event.trigger($scope.neighborhoods[id], 'click', function (event) {
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
