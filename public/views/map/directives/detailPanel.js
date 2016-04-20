/**
 * Created by chrissu on 2/26/16.
 */

app.directive('detailPanel', function() {
    return {
        restrict: 'E',
        scope: {
            preference: '=',
            categories: '='
        },
        link: function($scope, element, attrs){

        },
        controller: function ($scope) {
            $scope.getStars = function(n) {
                return new Array(n);
            };

            $scope.returnToResults = function() {
                $scope.$emit('return');
            };

            $scope.displayPreference = function(preference, value) {
              if (preference === 'nightlifePctOfAvg') {
                return (value>2?100:value*50)-50
              } else {
                return 100-(value>2?100:value*50)-50
              }
            }
        },
        templateUrl: './views/map/directives/detailPanel.html'
    };
});
