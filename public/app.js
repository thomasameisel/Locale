/**
 * Created by chrissu on 11/24/15.
 */
var app = angular.module('Apartment', ['snap', 'ngResource', 'ui.router']);


app.controller('navController', function($scope, $state) {
    $scope.goToLandingPage = function() {
        $state.go('landing');
    };

});