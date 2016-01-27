/**
 * Created by chrissu on 11/24/15.
 */
app.directive('question', function() {
    return {
        restrict: 'E',
        scope: {
            question: '=',
            selected:'='
        },
        link: function($scope, element, attrs){
            $scope.selected = attrs.selected;
        },
        controller: function ($scope) {
            $scope.select = function(index){
                $scope.selected = true;
            }
        },
        templateUrl: './js/directives/question.html'
    }
});