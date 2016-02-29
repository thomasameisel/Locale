/**
 * Created by chrissu on 12/12/15.
 */
app.controller('questionnaireController', function($scope, $stateParams, $state) {
    angular.element(document).ready(function() {
        $scope.loading = false;
    });

  $scope.questions = [
    {
      key: 'safety',
      text: 'Safety',
      options: [
        '1',
        '2',
        '3',
        '4',
        '5'
      ]
    },

    {
      key: 'qualityOfLife',
      text: 'Quality of Life',
      options: [
        '1',
        '2',
        '3',
        '4',
        '5'
      ]
    },

    {
      key: 'nightlife',
      text: 'Nightlife',
      options: [
        '1',
        '2',
        '3',
        '4',
        '5'
      ]
    },

    {
      key: 'affordability',
      text: 'Affordability',
      options: [
        '1',
        '2',
        '3',
        '4',
        '5'
      ]
    },

    {
      key: 'breathingRoom',
      text: 'Breathing Room',
      options: [
        '1',
        '2',
        '3',
        '4',
        '5'
      ]
    }
  ];

  $scope.submitAnswers = function() {
    $state.go('map', {lng : $stateParams.lng , lat : $stateParams.lat});
  };

});