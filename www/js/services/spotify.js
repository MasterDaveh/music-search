const spot = angular.module('spotifySrvc', ['utils']);

spot.factory('spotify', function(ajax){
  const baseURL = 'https://api.spotify.com/v1';
  const CLIENT_ID = '0bd2b7d36b5344faa55a8d4cf0ee104b';
  const REDIRECT_URI = encodeURIComponent( window.location.href );
  let token = null;
  let lastQuery = '';
  let pageIdx = 0;

  const concatenateResults = (items) => {
    let res = items.artists.items;
    res = res.concat(items.albums.items);
    res = res.concat(items.tracks.items);
    return res;
  }

  const getCommonHeaders = () => {
    return {
      Authorization: `Bearer ${ token }`
    }
  }

  // authorization process for the spotify search api
  const authorize = () => {

    // if the token param is present in the querystring it means
    // the user was redirected to the page from the spotify api login
    if( window.location.href.indexOf('access_token') === -1 ){
      let url = 'https://accounts.spotify.com/authorize?';
      url += `client_id=${ CLIENT_ID }`;
      url += '&response_type=token';
      url += `&redirect_uri=${ REDIRECT_URI }`;
      url += '&state=118';
      window.location.href = url;
    } else {
      // recover the access token
      const pageURL = window.location.href;
      const idx = pageURL.indexOf('access_token');
      token = pageURL.slice( pageURL.indexOf('=', idx)+1, pageURL.indexOf('&', idx) );
    }
  }

  const search = (query, cb, options = {}) => {
    const limit = options.limit || 5;
    const offset = options.pageIdx? options.pageIdx * limit : 0;
    let url = `${ baseURL }/search?q=${ query }&type=album,artist,track&limit=${ limit }`;

    lastQuery = query;
    
    if( offset > 0 ){
      url += `&offset=${ offset }`;
    }
    ajax.call(url, {}, 
      (results) => cb(concatenateResults(results.data)),
      (result) => console.log(result), 
      'get', getCommonHeaders()
    );
  };

  const searchMore = (query, cb) => {
    pageIdx = lastQuery != query? 0 : pageIdx+1;
    const options = { pageIdx };
    search(query, cb, options);
  }

  return { search, concatenateResults, authorize, searchMore }
  
});