/**
 * Created by chrissu on 12/12/15.
 */
app.controller('questionnaireController', function($scope, $stateParams, $state, directionsDataService,$location, $anchorScroll) {
  $scope.temp ="225 E Wacker Dr, Chicago, IL, United States";
  $scope.timeLimit = directionsDataService.getTimeLimit();
  $scope.useCommute = directionsDataService.getUseCommute();

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
      id: 1,
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
      id: 2,
      key: 'qualityOfLife',
      text: 'How do you feel about drug use and prostitution?',
      options: [
        "B****, don't kill my vibe!",
        "It's the world's oldest profession for a reason.",
        "I don't mind, as long as it doesn't affect me.",
        "They're gateways to worse crimes.",
        'Just knowing they happen makes me sick.',
      ]
    },

    {
      id: 3,
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
      id: 4,
      key: 'affordability',
      text: 'My price range is best described as:',
      options: [
        'Warren Buffet asks me for loans.',
        'Comfort is worth a premium.',
        "An average apartment's cost.",
        "I'm trying not to break the bank.",
        'Just get me off the street.'
      ]
    },

    {
      id: 5,
      key: 'breathingRoom',
      text: 'How do you feel about crowds?',
      options: [
        'I love the hustle and bustle of city life.',
        'Meeting new people is fun.',
        "I'm pretty indifferent.",
        'I need some space to myself.',
        'I hate people.'
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

  $scope.$watch(
      function() {
        if ($scope.useCommute){
          console.log("Using commute");
          return $scope.isValidWorkplace && $scope.isValidQuestionnaire();
        } else {
          console.log("Not using commute");
          return $scope.isValidQuestionnaire();
        }
       },
      function(newVal, oldVal){
        $scope.ready = newVal;
      }
  );

  $scope.submitAnswers = function() {
      directionsDataService.setUseCommute($scope.useCommute);
      $state.go('map', {lng : $stateParams.lng , lat : $stateParams.lat});
  };


});
