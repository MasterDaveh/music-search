const spot = angular.module('spotifySrvc', ['utils']);

spot.factory('spotify', function(ajax, arrays){
  const baseURL = 'https://api.spotify.com/v1';
  const CLIENT_ID = '0bd2b7d36b5344faa55a8d4cf0ee104b';
  const REDIRECT_URI = encodeURIComponent( window.location.href );
  let token = null;
  let lastQuery = '';
  let pageIdx = 0;

  // organize the results in such a way that:
  // 1 - the first two spots of the search results are the 
  //     best result for the artist and album search 
  // 2 - the third and fourth spots are all the albums of the best artist result
  //     and all the tracks of the best artist result, respectively
  const normalize = (items) => {
    
    // placeholder object for the 'all albums' and 'all tracks result'
    let placeholder = {};

    // best results for artists and albums search
    const bestArtist = items.artists.items.shift();
    const bestAlbum = items.albums.items.shift();

    let res = concatenateResults( items );

    arrays.shuffle( res );
    
    placeholder = angular.copy(bestArtist);
    placeholder.type = 'all_tracks';
    res.unshift(placeholder);

    placeholder = angular.copy(bestAlbum);
    placeholder.type = 'all_albums';
    res.unshift(placeholder);

    res.unshift(...[bestArtist, bestAlbum]);

    return res;
  }

  const concatenateResults = (arr) => {
    let res = arr.artists.items;
    res = res.concat(arr.albums.items);
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
    // default for every search term is true
    const searchAlbums = angular.isDefined(options.albums)? options.albums: true;
    const searchArtist = angular.isDefined(options.artists)? options.artists: true;
    const searchTracks = angular.isDefined(options.tracks)? options.tracks: true;
    let searchTerms = [];

    if( !searchAlbums && !searchArtist && !searchTracks ){
      throw "spotifySrvc: you have to search either for artist, tracks or albums";
    }
    
    const offset = options.pageIdx? options.pageIdx * limit : 0;
    let url = `${ baseURL }/search?q=${ query }&type=`;
    
    if( searchArtist ){ 
      searchTerms.push('artist');
    }
    if( searchAlbums ){ 
      searchTerms.push('album');
    }
    if( searchTracks ){ 
      searchTerms.push('track');
    }

    url += searchTerms.join(',');
    url += `&limit=${ limit }`;

    lastQuery = query;
    
    if( offset > 0 ){
      url += `&offset=${ offset }`;
    }
    ajax.call(url, {}, 
      (results) => cb(results.data),
      (result) => console.log(result), 
      'get', getCommonHeaders()
    );
  };

  const get = ( opts, done ) => {
    const { queryArtists } = opts;
    const query = queryArtists.map(x => x.name).join(' ');

    opts.artists = false;
    opts.limit = 50;

    search(query, (res) => {
      if( opts.albums ){
        res = res.albums;
        res = res.items.filter(x => x.album_type === 'album')
      } else if( opts.tracks ){
        res = res.tracks.items;
      }
      done(res);
    }, opts);
  }

  const searchMore = (query, done) => {
    pageIdx = lastQuery != query? 0 : pageIdx+1;
    const options = { pageIdx };
    const onSearchDone = ( result ) => {
      done(concatenateResults( result ));
    }
    search(query, onSearchDone, options);
  }

  // TODO: when running in production the spotify service doesn't have to expose
  // concatenateResults, here only for testing purposes
  return { search, concatenateResults, authorize, searchMore, normalize, get }
  
});