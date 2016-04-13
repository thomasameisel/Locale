/**
 * Created by chrissu on 4/11/16.
 */
app.directive('googlesearch', function() {

    var uniqueId = 1;
    return {
        restrict: 'E',
        scope: true,
        link: function($scope){

        },
        controller: function ($scope, $state, communityDataService, $stateParams, $timeout) {
            $scope.id = 'searchbox'+uniqueId++;

            $scope.$watch(
                function() {return document.getElementById($scope.id)},
                function(newValue, oldValue) {
                    if (newValue)
                    {
                        setup(newValue);
                    }
                }
            );

            var setup = function(input){
                var autocomplete = new google.maps.places.Autocomplete(input, { types: ['(cities)']});

                var geocoder = new google.maps.Geocoder();

                $scope.search = function() {
                    var address = document.getElementById($scope.id).value;

                    geocoder.geocode({'address': address}, function(results, status) {
                        if (status === google.maps.GeocoderStatus.OK) {
                            communityDataService.setCity(results[0].address_components[0].long_name);
                            $state.go('questionnaire', {lng: results[0].geometry.location.lng(), lat : results[0].geometry.location.lat()});
                        } else {
                            $scope.error = status;
                        }
                    });
                };

                $scope.press = function (event) {
                    if(event.which === 13) {
                        $scope.search();
                    }
                };
            };

        },
        templateUrl: './views/directives/googlesearch.html'
    };
});
