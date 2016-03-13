/**
 * Created by chrissu on 12/12/15.
 */
app.controller('questionnaireController', function($scope, $stateParams, $state, directionsDataService) {
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


  var input = document.getElementById('workplaceBox');
  var autocomplete = new google.maps.places.Autocomplete(input);

  var geocoder = new google.maps.Geocoder();

  $scope.setAddress = function() {
    var address = document.getElementById('workplaceBox').value;

    geocoder.geocode({'address': address}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        directionsDataService.directions({destination : results[0].formatted_address})
        .done(function (result) {
            $scope.coodinates = result;
        })
      } else {
        $scope.error = status;
      }
    });
  };

  $scope.submitAnswers = function() {
    $state.go('map', {lng : $stateParams.lng , lat : $stateParams.lat});
  };

});