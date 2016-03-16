app.directive('sliderbar', function() {
    return {
        restrict: 'E',
        scope: {
            minute: '='
        },
        link: function($scope, element, attrs){

        },
        controller: function ($scope, directionsDataService) {

            $scope.slider = $('#questionnaireSlider').slider()
                .on('slide', function(ev){
                    updateSliderVal($scope.slider);
                })
                .data('slider');

            $scope.slider.showTooltip();
            $scope.minute = $scope.slider.getValue();
            function updateSliderVal(slider){
                $scope.minute = slider.getValue();
                directionsDataService.setTimeLimit(slider.getValue());
                $scope.$apply();
            }
        },
        templateUrl: './views/directives/sliderbar.html'
    };
});