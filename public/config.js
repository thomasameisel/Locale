/**
 * Created by chrissu on 2/3/16.
 */
app.config(function($routeProvider, $locationProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'questionnaire/questionnaire.html',
      controller: 'questionnaire/questionnaireController.js'
    })
    .when('map', {
      templateUrl: 'map/map.html',
      controller: 'map/mapController.js'
    });

});