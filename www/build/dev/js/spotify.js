'use strict';

var spot = angular.module('spotifySrvc', ['utils']);

spot.factory('spotify', function (ajax, arrays, lstorage, $timeout) {
  var baseURL = 'https://api.spotify.com/v1';
  var REDIRECT_URI = encodeURIComponent(window.location.href);
  var lastQuery = '';
  var pageIdx = 0;

  var TOKEN_KEY = 'access_token';
  var DEFAULT_COUNTRY = 'US';

  // organize the results in such a way that:
  // 1 - the first two spots of the search results are the 
  //     best result for the artist and album search 
  // 2 - the third and fourth spots are all the albums of the best artist result
  //     and all the tracks of the best artist result, respectively
  var normalize = function normalize(items) {

    // placeholder object for the 'all albums' and 'all tracks result'
    var placeholder = {};

    // best results for artists and albums search
    var bestArtist = items.artists.items.shift();
    var bestAlbum = items.albums.items.shift();

    var res = concatenateResults(items);

    arrays.shuffle(res);

    if (bestArtist) {
      placeholder = angular.copy(bestArtist);
      placeholder.type = 'top_tracks';
      res.unshift(placeholder);
    }

    if (bestAlbum) {
      placeholder = angular.copy(bestArtist);
      placeholder.type = 'all_albums';
      res.unshift(placeholder);
    }

    if (bestAlbum) {
      res.unshift(bestAlbum);
    }

    if (bestArtist) {
      res.unshift(bestArtist);
    }

    return res;
  };

  var concatenateResults = function concatenateResults(arr) {
    var res = arr.artists.items;
    res = res.concat(arr.albums.items);
    return res;
  };

  var getCommonHeaders = function getCommonHeaders(token) {
    return {
      Authorization: 'Bearer ' + token
    };
  };

  // authorization process for the spotify search api
  var authorize = function authorize() {
    var token = lstorage.get(TOKEN_KEY);
    if (!token) {
      // if the token param is present in the querystring it means
      // the user was redirected to the page from the spotify api login
      if (window.location.href.indexOf(TOKEN_KEY) === -1) {
        var url = 'https://accounts.spotify.com/authorize?';
        url += 'client_id=' + CLIENT_ID;
        url += '&response_type=token';
        url += '&redirect_uri=' + REDIRECT_URI;
        url += '&state=118';
        window.location.href = url;
      } else {
        // retrieve ACCESS_TOKEN from url
        var pageURL = window.location.href;
        var idx = pageURL.indexOf('access_token');
        var expiration_offset = 0;

        token = pageURL.slice(pageURL.indexOf('=', idx) + 1, pageURL.indexOf('&', idx));
        lstorage.set(TOKEN_KEY, token);

        idx = pageURL.indexOf('expires_in');
        expiration_offset = pageURL.slice(pageURL.indexOf('=', idx) + 1, pageURL.indexOf('&', idx));
        // removing the access_token will force the authorization process to begin 
        // when the token will expire
        $timeout(function () {
          return lstorage.remove(TOKEN_KEY);
        }, expiration_offset * 1000);

        window.location.href = pageURL.slice(0, pageURL.indexOf('#'));
      }
    }
  };

  var search = function search(query, cb) {
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    var limit = options.limit || 5;
    // default for every search term is true
    var searchAlbums = angular.isDefined(options.albums) ? options.albums : true;
    var searchArtist = angular.isDefined(options.artists) ? options.artists : true;
    var searchTracks = angular.isDefined(options.tracks) ? options.tracks : true;
    var searchTerms = [];
    var offset = 0;
    var url = '';
    var token = '';
    var headers = {};

    if (!searchAlbums && !searchArtist && !searchTracks) {
      throw "spotifySrvc: you have to search either for artist, tracks or albums";
    }

    offset = options.pageIdx ? options.pageIdx * limit : 0;
    url = baseURL + '/search?q=' + query + '&market=' + DEFAULT_COUNTRY + '&type=';
    token = lstorage.get(TOKEN_KEY);
    headers = getCommonHeaders(token);

    if (!token) {
      authorize();
    }

    if (searchArtist) {
      searchTerms.push('artist');
    }
    if (searchAlbums) {
      searchTerms.push('album');
    }
    if (searchTracks) {
      searchTerms.push('track');
    }

    url += searchTerms.join(',');
    url += '&limit=' + limit;

    lastQuery = query;

    if (offset > 0) {
      url += '&offset=' + offset;
    }
    ajax.call(url, {}, function (results) {
      return cb(results.data);
    }, function (result) {
      return console.log(result);
    }, 'get', headers);
  };

  var getAlbumTracksByID = function getAlbumTracksByID(albumID, done) {
    var url = baseURL + '/albums/' + albumID + '/tracks?market=' + DEFAULT_COUNTRY;
    var token = lstorage.get(TOKEN_KEY);
    var headers = getCommonHeaders(token);

    ajax.call(url, {}, function (res) {
      var tracks = res.data.items;
      tracks = tracks.sort(sortByPopularity);
      done(tracks);
    }, function (err) {
      return console.log(err.data);
    }, 'get', headers);
  };

  var getAlbumsDetailsByID = function getAlbumsDetailsByID(ids, done) {
    var url = baseURL + '/albums?ids=' + ids.join(',');
    url += '&market=' + DEFAULT_COUNTRY;
    url += '&album_type=album';
    var token = lstorage.get(TOKEN_KEY);
    var headers = getCommonHeaders(token);
    ajax.call(url, {}, function (res) {
      var albums = res.data.albums;
      done(albums);
    }, function (err) {
      return console.log(err.data);
    }, 'get', headers);
  };

  var getReleaseYear = function getReleaseYear(album) {
    var year = album.release_date;
    if (album.release_date_precision != 'year') {
      year = year.slice(0, year.indexOf('-'));
    }
    return year;
  };

  var getAlbumsByArtistID = function getAlbumsByArtistID(artistID, done) {
    var url = baseURL + '/artists/' + artistID + '/albums?market=' + DEFAULT_COUNTRY;
    var token = lstorage.get(TOKEN_KEY);
    var headers = getCommonHeaders(token);
    // The spotify albums endpoint allows a maximum of 20 ids
    var IDCOUNT = 20;
    ajax.call(url, {}, function (res) {
      var ids = [];
      var items = res.data.items.sort(sortByPopularity);
      for (var i = 0; i < items.length; i++) {
        if (i > IDCOUNT) break;
        ids.push(items[i].id);
      }
      getAlbumsDetailsByID(ids, function (albums) {
        albums.forEach(function (album) {
          album.release_year = getReleaseYear(album);
        });
        done(albums);
      });
    }, function (err) {
      return console.log(err.data);
    }, 'get', headers);
  };

  var getTracksByArtistID = function getTracksByArtistID(artistID, done) {
    var url = baseURL + '/artists/' + artistID + '/top-tracks?country=' + DEFAULT_COUNTRY;
    var token = lstorage.get(TOKEN_KEY);
    var headers = getCommonHeaders(token);
    ajax.call(url, {}, function (res) {
      var tracks = res.data.tracks;
      tracks = tracks.sort(sortByPopularity);
      done(tracks);
    }, function (err) {
      return console.log(err.data);
    }, 'get', headers);
  };

  var sortByPopularity = function sortByPopularity(curr, prev) {
    return prev.popularity - curr.popularity;
  };

  var searchMore = function searchMore(query, done) {
    pageIdx = lastQuery != query ? 0 : pageIdx + 1;
    var options = { pageIdx: pageIdx };
    var onSearchDone = function onSearchDone(result) {
      done(concatenateResults(result));
    };
    search(query, onSearchDone, options);
  };

  return {
    search: search, searchMore: searchMore,
    concatenateResults: concatenateResults, normalize: normalize,
    authorize: authorize,
    getAlbumTracksByID: getAlbumTracksByID, getAlbumsByArtistID: getAlbumsByArtistID, getTracksByArtistID: getTracksByArtistID, getAlbumsDetailsByID: getAlbumsDetailsByID
  };
});