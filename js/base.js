const base = angular.module('base', ['home', 'spotifySrvc']);

base.config(function( $locationProvider ){

  $locationProvider.html5Mode(true);
});

base.run(function( spotify ){
  spotify.authorize();
})