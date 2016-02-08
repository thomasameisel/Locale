
app.config(function($routeProvider, $locationProvider){
   $routeProvider
       .when('/', {
            templateUrl: './views/questionnaire/questionnaire.html',
            controller: './views/questionnaire/questionnaireController.js'
        })
       .when('map', {
           templateUrl: 'views/map/map.html',
           controller: 'views/map/mapController.js'
       })
});