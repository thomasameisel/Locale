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

        },
        controller: function ($scope) {
            $scope.selected = -1;
            $scope.select = function(index){
                $scope.selected = index;
            };
        },
        templateUrl: './views/questionnaire/directives/question.html'
    };
});
