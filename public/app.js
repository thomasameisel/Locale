/**
 * Created by chrissu on 11/24/15.
 */
var app = angular.module('Apartment', ['snap', 'ngResource', 'ui.router', 'ngAnimate']);


app.controller('navController', function($scope, $state, communityDataService) {

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

    $scope.goToLandingPage = function(){
        communityDataService.resetParams(true);
        $state.go('landing');
    };


    $scope.retakeSurvey = function(){
        //communityDataService.resetParams(false);
        $state.go('questionnaire');
    };

});