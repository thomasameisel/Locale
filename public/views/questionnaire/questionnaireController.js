/**
 * Created by chrissu on 12/12/15.
 */
app.controller('questionnaireController', function($scope, $stateParams, $state, directionsDataService) {

  $scope.temp ="225 E Wacker Dr, Chicago, IL, United States";
  $scope.timeLimit = 10;

  $scope.isValidQuestionnaire = function () {
    for (var i = 0; i < $scope.questions.length; i++) {
      if (!$scope.questions[i].answered) {
        return false;
      }
    }
    return true;
  };

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
  
  $scope.searched = false;
  $scope.isValidWorkplace = false;
  var input = document.getElementById('workplaceBox');
  var autocomplete = new google.maps.places.Autocomplete(input, ['street_address']);


  $scope.setAddress = function() {
    var address = document.getElementById('workplaceBox').value;
    var geocoder = new google.maps.Geocoder();

    geocoder.geocode({'address': address}, function(results, status) {
      $scope.loading = true;
      if (status === google.maps.GeocoderStatus.OK) {
        $scope.loading = false;
        directionsDataService.setWorkplace({destination : results[0].formatted_address})
        .done(function () {
            $scope.isValidWorkplace = true;
            $scope.$apply();
        })
      } else {
        $scope.searched = true;
        $scope.loading = false;
        $scope.isValidWorkplace = false;
        $scope.$apply();
      }
    });
  };

  $scope.submitAnswers = function() {
    if ($scope.isValidWorkplace && $scope.isValidQuestionnaire()){
      $state.go('map', {lng : $stateParams.lng , lat : $stateParams.lat});
    }
  };

});