/**
 * Created by chrissu on 2/26/16.
 */

app.directive('detailPanel', function() {
    return {
        restrict: 'E',
        scope: {
            preference: '='
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
        },
        templateUrl: './views/map/directives/detailPanel.html'
    };
});
