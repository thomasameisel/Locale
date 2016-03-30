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
      text: 'Late at night, I would feel comfortable:',
      options: [
        'Doing anything. No one crosses me.',
        'Walking home with friends.',
        'Walking across the street from home.',
        'Taking a cab back alone.',
        'Being at home, with the door deadbolted.'
      ]
    },

    {
      key: 'qualityOfLife',
      text: 'How do you feel about drug use and prostitution?',
      options: [
        'Just knowing they happen makes me sick.',
        "They're gateways to worse crimes.",
        "I don't mind, as long as it doesn't affect me.",
        "It's the world's oldest profession for a reason.",
        "Bitch, don't kill my vibe!"
      ]
    },

    {
      key: 'nightlife',
      text: 'On a typical weekend night, I can be found:',
      options: [
        'Enjoying a book in peace and quiet.',
        'Staying in with friends.',
        'Sometimes I go out, others I stay in.',
        'Having a drink with friends.',
        "I usually can't remember my nights..."
      ]
    },

    {
      key: 'affordability',
      text: 'My price range is best described as:',
      options: [
        'Just get me off the street.',
        "I'm trying not to break the bank.",
        "An average apartment's cost.",
        'Comfort is worth a premium.',
        'Warren Buffet asks me for loans.'
      ]
    },

    {
      key: 'breathingRoom',
      text: 'How do you feel about crowds?',
      options: [
        'I hate people.',
        'I need some space to myself.',
        "I'm pretty indifferent.",
        'Meeting new people is fun.',
        'I love the hustle and bustle of city life.'
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
