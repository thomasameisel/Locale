
app.config(function($stateProvider, $urlRouterProvider){
    $stateProvider
       .state('landing', {
            name            :   '',
            url             :   '/',
            templateUrl     :   'views/landing/landing.html',
            controller      :   'landingController'
       })
       .state('questionnaire', {
            name            :   '',
            url             :   '/',
            templateUrl     :   'views/questionnaire/questionnaire.html',
            controller      :   'questionnaireController'
        })
       .state('map', {
            name            :   '',
            url             :   '/',
            templateUrl     :   'views/map/map.html',
            controller      :   'mapController'
       });

    $urlRouterProvider.otherwise("/");

});

