/**
 * Created by chrissu on 2/3/16.
 */
app.config(function($routeProvider, $locationProvider){
   $routeProvider
       .when('map', {
           templateUrl: 'map.html',
           controller: 'mapController'
       });
});