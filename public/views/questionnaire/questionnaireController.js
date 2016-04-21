/**
 * Created by chrissu on 12/12/15.
 */
app.controller('questionnaireController', function($scope, $stateParams, $state, directionsDataService, communityDataService, $location, $anchorScroll) {
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
  $scope.workplaceError = '';

  var defaultBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(41.643075, -87.865046),
    new google.maps.LatLng(42.028974, -87.525375));

  var input = document.getElementById('workplaceBox');
  var options = {
    bounds: defaultBounds,
    types: ['address']
  };

  autocomplete = new google.maps.places.Autocomplete(input, options);

  $scope.setAddress = function() {
    $scope.loading = true;
    var address = document.getElementById('workplaceBox').value;
    var geocoder = new google.maps.Geocoder();

    geocoder.geocode({'address': address}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        var address = results[0];

        // check to see if work place address is in Chicago
        var components = address.address_components;
        var city = '';
        for (var i = 0; i < components.length; ++i) {
          if (components[i].types[0] === 'locality' && components[i].types[1] === 'political') {
            city = components[i].long_name;
            break;
          }
        }
        if (city !== "Chicago"){
          $scope.workplaceError = "Please enter a work place address in Chicago";
          $scope.searched = true;
          $scope.loading = false;
          $scope.isValidWorkplace = false;
          $scope.$apply();
        } else {
          $scope.workplaceError = '';
          var destination = {
            city: communityDataService.getCity(),
            lat: address.geometry.location.lat(),
            lng: address.geometry.location.lng()
          };
          directionsDataService.setWorkplace(destination)
              .done(function () {
                $scope.loading = false;
                $scope.isValidWorkplace = true;
                $scope.$apply();
              })
        }

      } else {
        $scope.searched = true;
        $scope.loading = false;
        $scope.isValidWorkplace = false;

        $scope.workplaceError = "Please enter a valid address";
        $scope.$apply();
      }
    });
  };

  $scope.$watch(
      function() {
        if ($scope.useCommute){
          return $scope.isValidWorkplace && $scope.isValidQuestionnaire();
        } else {
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
