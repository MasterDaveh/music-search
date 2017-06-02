const utils = angular.module('utils', []);

utils.factory('ajax', function ($http) {
  const call = (url, data, succCB, errCB, method = 'post', headers = {}) => {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    return $http({ method, headers, url, data }).then(succCB, errCB);
  }

  return { call }
});

utils.factory('arrays', function ($http) {
  const shuffle = ( arr, exit = false ) => {
    let i, j, tmp;
    for( i=arr.length-1; i>0; i-- ){
      j = Math.floor(Math.random() * (i + 1));
      tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }

    // attempting to lower probability of having elements in the same position
    // they had before the shuffling
    if( !exit ){ 
      shuffle(arr, true);
    }
    return arr;
  }

  return { shuffle }
});

utils.factory('lstorage', function () {
  let get = key => {
    let val = window.localStorage.getItem(key);
    try {
      val = JSON.parse( val );
    } catch (ex) {
      val = val.replace('/', '');
    }

    return val;
  };
  let set = (key, value) => {
    let val = value;
    if (angular.isObject(val)) {
      val = JSON.stringify(value);
    } else if( angular.isNumber(value) ){
      // gli appendo una slash, che farà fallire la json.parse
      // così se ho salvato un intero non viene convertito in stringa
      val = `/${ val }`;
    }
    window.localStorage.setItem(key, val);
  };
  let remove = key => window.localStorage.removeItem(key);
  let clear = () => window.localStorage.clear();

  return {
    get,
    set,
    remove,
    clear
  }

});