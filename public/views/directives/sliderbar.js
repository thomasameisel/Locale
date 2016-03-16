app.directive('sliderbar', function() {
    return {
        restrict: 'E',
        scope: {
            timeLimit: '='
        },
        link: function($scope, element, attrs){

        },
        controller: function ($scope, directionsDataService) {

            $scope.slider = $('#questionnaireSlider').slider()
                .on('slide', function(ev){
                    updateSliderVal($scope.slider);
                    $scope.$apply();

                    $scope.$emit('timeChange', function (ev) {
                       console.log("emit slider value:" + $scope.timeLimit)
                    });
                })
                .data('slider');

            $scope.slider.setValue($scope.timeLimit);
            $scope.slider.showTooltip();
            //$scope.timeLimit = $scope.slider.getValue();
            function updateSliderVal(slider){
                $scope.timeLimit = slider.getValue();
                directionsDataService.setTimeLimit(slider.getValue());
                $scope.$apply();
            }
        },
        templateUrl: './views/directives/sliderbar.html'
    };
});