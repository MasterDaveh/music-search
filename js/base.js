const base = angular.module('base', ['home']);

base.config(function ($locationProvider) {

  $locationProvider.html5Mode(true);
});