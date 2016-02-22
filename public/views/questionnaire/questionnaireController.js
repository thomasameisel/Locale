/**
 * Created by chrissu on 12/12/15.
 */
app.controller('questionnaireController', function($scope, $stateParams, $state) {
    angular.element(document).ready(function() {
        $scope.loading = false;
    });
  $scope.questions = [
    {
      text: 'Crime',
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
      text: 'Nightlife',
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
      text: 'Late at night, I feel comfortable',
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
      text: 'Late at night, I feel comfortable',
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