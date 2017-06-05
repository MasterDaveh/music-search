'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var home = angular.module('home', ['spotifySrvc', 'modalHelper']);

home.controller('homeCtrl', function ($scope, $rootScope, spotify, modalHelper) {

  $scope.query = '';
  $scope.currentQuery = '';
  $scope.results = null;

  $scope.showUpperLoader = false;
  $scope.showLowerLoader = false;

  $rootScope.openAlbumsModal = false;
  $rootScope.openTracksModal = false;

  var modals = {
    albums: 'openAlbumsModal',
    tracks: 'openTracksModal'
  };

  var allowedTypes = ['all_albums', 'top_tracks', 'album'];

  modalHelper.on('close', function (modalId) {
    $rootScope[modalId] = false;
  });

  var getTracksModel = function getTracksModel(item, tracks) {
    return {
      header: {
        pic: $scope.getPic(item),
        name: item.name
      },
      tracks: tracks,
      type: item.type,
      modalId: modals.tracks
    };
  };

  var getAlbumsModel = function getAlbumsModel(item, albums) {
    return {
      header: {
        pic: $scope.getPic(item),
        name: item.name
      },
      albums: albums,
      modalId: modals.albums
    };
  };

  $scope.search = function (query) {
    if (query.trim().length === 0) return;
    $scope.currentQuery = query;
    $scope.showUpperLoader = true;
    spotify.search($scope.currentQuery, function (results) {
      $scope.results = spotify.normalize(results);
      $scope.showUpperLoader = false;
    });
  };

  $scope.getPic = function (result) {
    var pic = '';
    // track
    if (!result.images) {
      pic = { url: $scope.getPic(result.album) };
    } else {
      //  albums/artists
      if (result.images.length === 1) {
        pic = result.images[0];
      } else if (result.images.length > 0) {
        pic = result.images[1];
      }
    }
    return pic.url;
  };

  $scope.more = function () {
    $scope.showLowerLoader = true;
    spotify.searchMore($scope.currentQuery, function (results) {
      var _$scope$results;

      (_$scope$results = $scope.results).push.apply(_$scope$results, _toConsumableArray(results));
      $scope.showLowerLoader = false;
    });
  };

  $scope.showBlurred = function (result) {
    return ['all_albums', 'top_tracks'].indexOf(result.type) > -1;
  };

  $scope.show = function (item) {
    if (allowedTypes.indexOf(item.type) === -1) return;

    if (item.type === 'all_albums') {
      modalHelper.clearModel(modals.albums);
      $rootScope.openAlbumsModal = true;
      modalHelper.publish('showLoader', [modals.albums]);
      spotify.getAlbumsByArtistID(item.id, function (albums) {
        var model = getAlbumsModel(item, albums);
        modalHelper.setModel(model);
        modalHelper.publish('hideLoader', [modals.albums]);
      });
    } else if (item.type === 'top_tracks') {
      modalHelper.clearModel(modals.tracks);
      $rootScope.openTracksModal = true;
      modalHelper.publish('showLoader', [modals.tracks]);
      spotify.getTracksByArtistID(item.id, function (tracks) {
        var model = getTracksModel(item, tracks);
        modalHelper.setModel(model);
        modalHelper.publish('hideLoader', [modals.tracks]);
      });
    } else if (item.type === 'album') {
      modalHelper.clearModel(modals.tracks);
      $rootScope.openTracksModal = true;
      modalHelper.publish('showLoader', [modals.tracks]);
      spotify.getAlbumTracksByID(item.id, function (tracks) {
        var model = getTracksModel(item, tracks);
        modalHelper.setModel(model);
        modalHelper.publish('hideLoader', [modals.tracks]);
      });
    }
  };
});