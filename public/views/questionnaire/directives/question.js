/**
 * Created by chrissu on 11/24/15.
 */
app.directive('question', function() {
    return {
        restrict: 'E',
        scope: {
            question: '=',
            questionid: '='
        },
        link: function($scope, element, attrs){

        },
        controller: function ($scope, communityDataService) {
            $scope.select = function(index){
                $scope.selected = index;
                communityDataService.setFilters($scope.question.key, $scope.selected+1);
                $scope.question.answered = true;
            };
        },
        templateUrl: './views/questionnaire/directives/question.html'
    };
});
