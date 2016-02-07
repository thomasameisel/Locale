/**
 * Created by chrissu on 12/12/15.
 */
app.controller('questionsController', function($scope, $http, $location) {
  angular.element(document).ready(function() {
    $scope.loading = false;
  });

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