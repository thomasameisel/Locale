/**
 * Created by chrissu on 11/24/15.
 */
var app = angular.module('Apartment', ['snap', 'ngResource', 'ui.router', 'ngAnimate']);


app.controller('navController', function($scope, $state, communityDataService) {

    $scope.requestChangeCity = function() {

        //communityDataService.resetParams();
    };

    $scope.$watch(
        function() { return communityDataService.getCity(); },
        function(newVal, oldVal){
            $scope.city = newVal;
        }
    );

    $scope.$watch(
        function() { return $state.current; },
        function(newVal, oldVal){
            $scope.inMapState = newVal.name == 'map';
        }
    );

    $scope.retakeSurvey = function(){
        $state.go('questionnaire', {lng : $stateParams.lng , lat : $stateParams.lat});
    };

});