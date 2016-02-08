
app.config(function($routeProvider, $locationProvider){
   $routeProvider
       .when('/', {
            templateUrl: 'views/questionnaire/questionnaire.html',
            controller: 'questionnaireController'
        })
       .when('map', {
           templateUrl: 'views/map/map.html',
           controller: 'mapController'
       })
});