/**
 * Created by chrissu on 12/12/15.
 */
app.controller('questionnaireController', function($scope, $stateParams, $state) {
    angular.element(document).ready(function() {
        $scope.loading = false;
    });

  $scope.questions = [
    {
      key: 'violentCrime',
      text: 'violentCrime',
      options: [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6'
      ]
    },

    {
      key: 'nonViolentCrime',
      text: 'nonviolentCrime',
      options: [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6'
      ]
    },

    {
      key: 'nightlife',
      text: 'nightlife',
      options: [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6'
      ]
    },

    {
      key: 'price',
      text: 'price',
      options: [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6'
      ]
    },

    {
      key: 'crowded',
      text: 'crowded',
      options: [
        '1',
        '2',
        '3',
        '4',
        '5',
        '6'
      ]
    }
  ];

  $scope.submitAnswers = function() {
    $state.go('map', {lng : $stateParams.lng , lat : $stateParams.lat});
  };

});