
app.config(function($stateProvider, $urlRouterProvider){
    $stateProvider
       .state('landing', {
            name            :   'Main Page',
            url             :   '/',
            templateUrl     :   'views/landing/landing.html',
            controller      :   'landingController'
       })
       .state('questionnaire', {
            name            :   'Questionnaire Page',
            url             :   '/',
            templateUrl     :   'views/questionnaire/questionnaire.html',
            controller      :   'questionnaireController'
        })
       .state('map', {
            name            :   'Map Page',
            url             :   '/',
            templateUrl     :   'views/map/map.html',
            controller      :   'mapController'
       });

    $urlRouterProvider.otherwise("/");

});

