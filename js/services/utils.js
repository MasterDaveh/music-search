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

    // trying to lower probability of having elements in the same position
    // they had before the shuffling
    if( !exit ){ 
      shuffle(arr, true);
    }
    return arr;
  }

  return { shuffle }
});