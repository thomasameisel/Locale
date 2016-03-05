app.controller('mapController', function($scope, $stateParams, communityDataService) {

    //Obtain lat and lng for searched city
    var lat = parseFloat($stateParams.lat),
        lng = parseFloat($stateParams.lng);

    $scope.categories = {
        violentCrimePctOfAvg    :   'Safety',
        nonViolentCrimePctOfAvg :   'Quality of Life',
        nightlifePctOfAvg       :   'Nightlife',
        pricePctOfAvg           :   'Affordability',
        crowdedPctOfAvg         :   'Breathing Room'
    };

    $scope.preferences = [];
    $scope.showDetail = false;

    //Populate map with preferences from database
    $scope.setPreferences = function() {
        communityDataService.preferences()
            .done(function (result) {
                for (var i = 0; i < 10; i++) {
                    for (var criteria in result[i].goodCriteria) {
                        if (result[i].goodCriteria.hasOwnProperty(criteria) &&
                            criteria !== 'nightlifePctOfAvg') {
                            var inverse = 2 - result[i].goodCriteria[criteria];
                            result[i].goodCriteria[criteria] = (inverse < 0) ?
                                                                0.05 : inverse;
                        }
                    }
                    for (var criteria in result[i].badCriteria) {
                        if (result[i].badCriteria.hasOwnProperty(criteria) &&
                            criteria !== 'nightlifePctOfAvg') {
                            var inverse = 2 - result[i].badCriteria[criteria];
                            result[i].badCriteria[criteria] = (inverse < 0) ?
                                                                0.05 : inverse;
                        }
                    }
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
        $scope.neighborhoods = [];

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

                $scope.map.fitBounds(this.bounds);
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
        google.maps.event.trigger($scope.neighborhoods[index], 'click', function (event) {
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