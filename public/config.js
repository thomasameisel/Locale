
app.config(function($stateProvider, $urlRouterProvider){
    $stateProvider
       .state('landing', {
            name            :   'landing',
            url             :   '/',
            templateUrl     :   'views/landing/landing.html',
            controller      :   'landingController'
       })
       .state('questionnaire', {
            name            :   'questionnaire',
            url             :   '/questionnaire?lat&lng',
            templateUrl     :   'views/questionnaire/questionnaire.html',
            controller      :   'questionnaireController'
        })
       .state('map', {
            name            :   'map',
            url             :   '/map?lat&lng',
            templateUrl     :   'views/map/map.html',
            controller      :   'mapController'
       });

    $urlRouterProvider.otherwise("/");

});

