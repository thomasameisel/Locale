/**
 * Created by chrissu on 11/24/15.
 */
app.directive('question', function() {
<<<<<<< HEAD:public/views/questionnaire/directives/question.js
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
        templateUrl: 'question.html'
    }
=======
  return {
    restrict: 'E',
    scope: {
      question: '=',
      selected: '='
    },
    link: function($scope, element, attrs) {
      $scope.selected = attrs.selected;
    },
    controller: function($scope) {
      $scope.select = function(index) {
        $scope.selected = true;
      };
    },
    templateUrl: './js/directives/question.html'
  };
>>>>>>> aa3e78b57a305bdfe01f74a15f02852602e6ad77:public/questionnaire/directives/question.js
});