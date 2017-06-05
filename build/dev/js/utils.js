'use strict';

var utils = angular.module('utils', []);

utils.factory('ajax', function ($http) {
  var call = function call(url, data, succCB, errCB) {
    var method = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'post';
    var headers = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};

    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    return $http({ method: method, headers: headers, url: url, data: data }).then(succCB, errCB);
  };

  return { call: call };
});

utils.factory('arrays', function ($http) {
  var shuffle = function shuffle(arr) {
    var exit = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

    var i = void 0,
        j = void 0,
        tmp = void 0;
    for (i = arr.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }

    // attempting to lower probability of having elements in the same position
    // they had before the shuffling
    if (!exit) {
      shuffle(arr, true);
    }
    return arr;
  };

  return { shuffle: shuffle };
});

utils.factory('lstorage', function () {
  var get = function get(key) {
    var val = window.localStorage.getItem(key);
    try {
      val = JSON.parse(val);
    } catch (ex) {
      val = val.replace('/', '');
    }

    return val;
  };
  var set = function set(key, value) {
    var val = value;
    if (angular.isObject(val)) {
      val = JSON.stringify(value);
    } else if (angular.isNumber(value)) {
      // gli appendo una slash, che farà fallire la json.parse
      // così se ho salvato un intero non viene convertito in stringa
      val = '/' + val;
    }
    window.localStorage.setItem(key, val);
  };
  var remove = function remove(key) {
    return window.localStorage.removeItem(key);
  };
  var clear = function clear() {
    return window.localStorage.clear();
  };

  return {
    get: get,
    set: set,
    remove: remove,
    clear: clear
  };
});