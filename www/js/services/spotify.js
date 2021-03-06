const spot = angular.module('spotifySrvc', ['utils']);

spot.factory('spotify', function(ajax, arrays, lstorage, $timeout){
  const baseURL = 'https://api.spotify.com/v1';
  const REDIRECT_URI = encodeURIComponent( window.location.href );
  let lastQuery = '';
  let pageIdx = 0;

  const TOKEN_KEY = 'access_token';
  const DEFAULT_COUNTRY = 'US';

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
    
    if( bestArtist ){
      placeholder = angular.copy(bestArtist);
      placeholder.type = 'top_tracks';
      res.unshift(placeholder);
    }

    if( bestAlbum ){
      placeholder = angular.copy(bestArtist);
      placeholder.type = 'all_albums';
      res.unshift(placeholder);
    }

    if( bestAlbum ){
      res.unshift(bestAlbum);
    }
    
    if(bestArtist){
      res.unshift(bestArtist);
    }

    return res;
  }

  const concatenateResults = (arr) => {
    let res = arr.artists.items;
    res = res.concat(arr.albums.items);
    return res;
  }

  const getCommonHeaders = (token) => {
    return {
      Authorization: `Bearer ${ token }`
    }
  }

  // authorization process for the spotify search api
  const authorize = () => {
    let token = lstorage.get(TOKEN_KEY);
    if( !token ){
      // if the token param is present in the querystring it means
      // the user was redirected to the page from the spotify api login
      if( window.location.href.indexOf(TOKEN_KEY) === -1 ){
        let url = 'https://accounts.spotify.com/authorize?';
        url += `client_id=${ CLIENT_ID }`;
        url += '&response_type=token';
        url += `&redirect_uri=${ REDIRECT_URI }`;
        url += '&state=118';
        window.location.href = url;
      } else {
        // retrieve ACCESS_TOKEN from url
        const pageURL = window.location.href;
        let idx = pageURL.indexOf('access_token');
        let expiration_offset = 0;

        token = pageURL.slice( pageURL.indexOf('=', idx)+1, pageURL.indexOf('&', idx) );
        lstorage.set(TOKEN_KEY, token);

        idx = pageURL.indexOf('expires_in');
        expiration_offset = pageURL.slice( pageURL.indexOf('=', idx)+1, pageURL.indexOf('&', idx) );
        // removing the access_token will force the authorization process to begin 
        // when the token will expire
        $timeout(() => lstorage.remove(TOKEN_KEY), (expiration_offset * 1000));
        
        window.location.href = pageURL.slice(0, pageURL.indexOf('#'));
      }
    }
  }

  const search = (query, cb, options = {}) => {
    const limit = options.limit || 5;
    // default for every search term is true
    const searchAlbums = angular.isDefined(options.albums)? options.albums: true;
    const searchArtist = angular.isDefined(options.artists)? options.artists: true;
    const searchTracks = angular.isDefined(options.tracks)? options.tracks: true;
    let searchTerms = [];
    let offset = 0;
    let url = '';
    let token = '';
    let headers = {};

    if( !searchAlbums && !searchArtist && !searchTracks ){
      throw "spotifySrvc: you have to search either for artist, tracks or albums";
    }
    
    offset = options.pageIdx? options.pageIdx * limit : 0;
    url = `${ baseURL }/search?q=${ query }&market=${ DEFAULT_COUNTRY }&type=`;
    token = lstorage.get(TOKEN_KEY);
    headers = getCommonHeaders(token);

    if( !token ){ 
      authorize();
    }
    
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
      'get', headers
    );
  };

  const getAlbumTracksByID = ( albumID, done ) => {
    let url = `${ baseURL }/albums/${ albumID }/tracks?market=${ DEFAULT_COUNTRY }`;
    const token = lstorage.get(TOKEN_KEY);
    const headers = getCommonHeaders(token);
    
    ajax.call(url, {},
      (res) => {
        let tracks = res.data.items;
        tracks = tracks.sort(sortByPopularity);
        done(tracks);
      }, ( err ) => console.log(err.data),
      'get', headers
    );
  }

  const getAlbumsDetailsByID = (ids, done) => {
    let url = `${ baseURL }/albums?ids=${ ids.join(',') }`;
        url += `&market=${ DEFAULT_COUNTRY }`;
        url += '&album_type=album'
    const token = lstorage.get(TOKEN_KEY);
    const headers = getCommonHeaders(token);
    ajax.call(url, {},
      (res) => {
        const albums = res.data.albums;
        done(albums)
      }, (err) => console.log(err.data),
      'get', headers
    );
  }

  const getReleaseYear = (album) => {
    let year = album.release_date;
    if( album.release_date_precision != 'year' ){
      year = year.slice(0, year.indexOf('-'));
    }
    return year;
  }

  const getAlbumsByArtistID = ( artistID, done ) => {
    let url = `${ baseURL }/artists/${ artistID }/albums?market=${ DEFAULT_COUNTRY }`;
    const token = lstorage.get(TOKEN_KEY);
    const headers = getCommonHeaders(token);
    // The spotify albums endpoint allows a maximum of 20 ids
    const IDCOUNT = 20;
    ajax.call(url, {},
      (res) => {
        let ids = [];
        let items = res.data.items.sort(sortByPopularity);
        for(let i=0; i<items.length; i++){
          if( i > IDCOUNT ) break;
          ids.push(items[i].id);
        }
        getAlbumsDetailsByID(ids, (albums) => {
          albums.forEach((album) => {
            album.release_year = getReleaseYear(album);
          });
          done(albums);
        });
      }, ( err ) => console.log(err.data),
      'get', headers
    );
  }

  const getTracksByArtistID = ( artistID, done ) => {
    let url = `${ baseURL }/artists/${ artistID }/top-tracks?country=${ DEFAULT_COUNTRY }`;
    const token = lstorage.get(TOKEN_KEY);
    const headers = getCommonHeaders(token);
    ajax.call(url, {},
      (res) => {
        let tracks = res.data.tracks;
        tracks = tracks.sort(sortByPopularity);
        done(tracks);
      }, ( err ) => console.log(err.data),
      'get', headers
    );
  }

  const sortByPopularity = (curr, prev) => {
    return prev.popularity - curr.popularity;
  }

  const searchMore = (query, done) => {
    pageIdx = lastQuery != query? 0 : pageIdx+1;
    const options = { pageIdx };
    const onSearchDone = ( result ) => {
      done(concatenateResults( result ));
    }
    search(query, onSearchDone, options);
  }

  return { 
    search, searchMore,
    concatenateResults, normalize,
    authorize, 
    getAlbumTracksByID, getAlbumsByArtistID, getTracksByArtistID, getAlbumsDetailsByID
  }
  
});