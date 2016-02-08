/**
 * Created by chrissu on 12/12/15.
 */
<<<<<<< HEAD:public/views/questionnaire/questionnaireController.js
app.controller('questionnaireController', function($scope, $http, $location) {
    angular.element(document).ready(function() {
        $scope.loading = false;
    });
=======
app.controller('questionsController', function($scope, $http, $location) {
  angular.element(document).ready(function() {
    $scope.loading = false;
  });
>>>>>>> aa3e78b57a305bdfe01f74a15f02852602e6ad77:public/questionnaire/questionnaireController.js

  $scope.questions = [
    {
      text: 'On a typical weekend, I can be found',
      options: [
        'Drinking at a bar',
        'Reading at home',
        'Playing an outdoor sport',
        'Working out at the gym',
        'Watching a movie at home',
        'Hosting a party at home'
      ]
    },

    {
      text: 'Late at night, I feel comfortable',
      options: [
        'Walking home alone',
        'Staying at home',
        'Playing an outdoor sport',
        'Working out at the gym',
        'Watching a movie at home',
        'Hosting a party at home'
      ]
    }
  ];

  $scope.submitAnswers = function() {
    $location.path('/map');
  };
});