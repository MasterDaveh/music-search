const spot = angular.module('spotifySrvc', ['utils']);

spot.factory('spotify', function(ajax){
  const baseURL = 'https://api.spotify.com/v1';

  const concatenateResults = (items) => {
    let res = items.artists.items;
    res = res.concat(items.albums.items);
    res = res.concat(items.tracks.items);
    return res;
  }

  const search = (query, cb, options = {}) => {
    const limit = options.limit || 5;
    const url = `${ baseURL }/search?q=${ query }&type=album,artist,track&limit=${ limit }`;
    ajax.call(url, {}, 
      (results) => cb(concatenateResults(results.data)),
      (result) => console.log(result), 
      'get'
    );
  };

  return { search, concatenateResults }
  
});