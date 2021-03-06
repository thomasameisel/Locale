app.controller('mapController', function($scope, $stateParams, communityDataService, directionsDataService, $state) {
    var width = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    $scope.height = (width > 1000) ? '100vh' : '40vh';
    $scope.margin_left = (width > 1000) ? '400px' : '0';
    $scope.useCommute = directionsDataService.getUseCommute();

    var regOpacity = 0.9;
    var medOpacity = 0.7;
    var lightOpacity = 0.2;

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
    });

    $scope.categories = {
        violentCrimePctOfAvg    :   'Safety',
        nonViolentCrimePctOfAvg :   'Quality of Life',
        nightlifePctOfAvg       :   'Nightlife',
        pricePctOfAvg           :   'Affordability',
        crowdedPctOfAvg         :   'Breathing Room'
    };

    $scope.orderedCategories = [
      'violentCrimePctOfAvg',
      'nonViolentCrimePctOfAvg',
      'nightlifePctOfAvg',
      'pricePctOfAvg',
      'crowdedPctOfAvg'
    ];

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
    $scope.communityTimes = directionsDataService.getCommunityTime();
    $scope.timeLimit = directionsDataService.getTimeLimit();

    function addColors(result) {
        for (var i = 0; i < result.length; ++i) {
            result[i].color = colors[i % colors.length];
        }
        return result;
    }

    function invertResult(result) {
        if (result[0].normalizedPreferences.nightlifePctOfAvg < 1) {
            $scope.categories.nightlifePctOfAvg = 'Quietness';
        }
        for (var i = 0; i < result.length; ++i) {
            for (var criteria in result[i].allCriteria) {
                if (result[i].allCriteria.hasOwnProperty(criteria) &&
                      (criteria !== 'nightlifePctOfAvg' ||
                       result[i].normalizedPreferences[criteria] < 1)) {
                    var inverse = 2 - result[i].allCriteria[criteria];
                    if (inverse < 0) {
                      result[i].allCriteria[criteria] = 0.05;
                    } else if (inverse > 2) {
                      result[i].allCriteria[criteria] = 2;
                    } else {
                      result[i].allCriteria[criteria] = inverse;
                    }
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

            if ($scope.useCommute){
                var time = $scope.communityTimes[$scope.communityData[i].communityID];
                if (time === null || time > $scope.timeLimit){
                    continue;
                }
            }

            $scope.preferences.push($scope.communityData[i]);
            $scope.preferencesObj[$scope.communityData[i].communityID] = true;
            count++;
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
                fillOpacity     : regOpacity,
                name            : preference.name,
                prefIndex       : i
            });

            $scope.neighborhoods[preference.communityID] = neighborhood;

            google.maps.event.addListener(neighborhood, 'click', function () {
                document.getElementById('content').scrollTop = 0;

                for (var community in $scope.neighborhoods) {
                    if ($scope.neighborhoods.hasOwnProperty(community)) {
                        $scope.neighborhoods[community].setOptions({fillOpacity: lightOpacity});
                    }
                }

                this.fillOpacity = medOpacity;

                $scope.selectedPreference = communities[this.prefIndex];
                $scope.showDetail = true;

                //calcRoute($scope.preferences[this.prefIndex].bounds.getCenter());

                var bounds = new google.maps.LatLngBounds();

                for (var j = 0; j < $scope.selectedPreference.outline.length; j++) {
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
    }


    $scope.choose = function (index) {
        var id = $scope.preferences[index].communityID;
        google.maps.event.trigger($scope.neighborhoods[id], 'click', function (event) {
        });
    };

    $scope.$on('return', function () {
        returnToMainPanel();
    });

    function returnToMainPanel() {
        for (var community in $scope.neighborhoods) {
            if ($scope.neighborhoods.hasOwnProperty(community)) {
                $scope.neighborhoods[community].setOptions({fillOpacity: regOpacity});
            }
        }
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

    var addEvent = function(object, type, callback) {
        if (object == null || typeof(object) == 'undefined') return;
        if (object.addEventListener) {
            object.addEventListener(type, callback, false);
        } else if (object.attachEvent) {
            object.attachEvent("on" + type, callback);
        } else {
            object["on"+type] = callback;
        }
    };

    addEvent(window, 'resize', function() {
        $scope.map.fitBounds(defaultBounds);
        google.maps.event.addListenerOnce(map, 'idle', function() {
            google.maps.event.trigger(map, 'resize');
        });
        $scope.safeApply();
    });

    google.maps.event.addDomListener(window, 'load', function() {
        $scope.map.fitBounds(defaultBounds);
        google.maps.event.addListenerOnce(map, 'idle', function() {
            google.maps.event.trigger(map, 'resize');
        });
        $scope.safeApply();
    });
});
