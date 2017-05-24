const utils = angular.module('utils', []);

utils.factory('ajax', function ($http) {
  const call = (url, data, succCB, errCB, method = 'post') => {
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    return $http({ method, headers, url, data }).then(succCB, errCB);
  }

  return { call }
});