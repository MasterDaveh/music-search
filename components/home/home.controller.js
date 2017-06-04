const home = angular.module('home', ['spotifySrvc', 'modalHelper']);

home.controller('homeCtrl', function( $scope, $rootScope, spotify, modalHelper ){

  $scope.query = '';
  $scope.currentQuery = '';
  $scope.results = null;

  $scope.showUpperLoader = false;
  $scope.showLowerLoader = false;

  $rootScope.openAlbumsModal = false;
  $rootScope.openTracksModal = false;

  const modals = {
    albums: 'openAlbumsModal',
    tracks: 'openTracksModal'
  }

  const allowedTypes = ['all_albums', 'top_tracks', 'album'];

  modalHelper.on('close', (modalId) => {
    $rootScope[modalId] = false;
  });

  const getTracksModel = (item, tracks) => {
    return {
      header: {
        pic: $scope.getPic(item),
        name: item.name
      }, 
      tracks,
      type: item.type,
      modalId: modals.tracks
    };
  }

  const getAlbumsModel = (item, albums) => {
    return {
      header: {
        pic: $scope.getPic(item),
        name: item.name
      }, 
      albums,
      modalId: modals.albums
    };
  }

  $scope.search = (query) => {
    $scope.currentQuery = query;
    $scope.showUpperLoader = true;
    spotify.search( $scope.currentQuery, (results) => {
      $scope.results = spotify.normalize(results);
      $scope.showUpperLoader = false;
    });
  };

  $scope.getPic = (result) => {
    let pic = '';
    // track
    if( !result.images ){
      pic = { url: $scope.getPic(result.album) };
    } else {
      //  albums/artists
      if(result.images.length === 1){
        pic = result.images[0];
      } else if( result.images.length > 0 ){
        pic = result.images[1];
      }
    }
    return pic.url;
  }

  $scope.more = () => {
    $scope.showLowerLoader = true;
    spotify.searchMore($scope.currentQuery, (results) => {
      $scope.results.push( ...results );
      $scope.showLowerLoader = false;
    });
  }

  $scope.showBlurred = (result) => {
    return ['all_albums', 'top_tracks'].indexOf(result.type) > - 1;
  }

  $scope.show = function (item) {
    if( allowedTypes.indexOf(item.type) === -1 ) return;

    if( item.type === 'all_albums' ){
      modalHelper.clearModel(modals.albums);
      $rootScope.openAlbumsModal = true;
      modalHelper.publish('showLoader', [modals.albums]);
      spotify.getAlbumsByArtistID( item.id, (albums) => {
        const model = getAlbumsModel(item, albums);
        modalHelper.setModel(model);
        modalHelper.publish('hideLoader', [modals.albums]);
      });
    } else if( item.type === 'top_tracks' ){
      modalHelper.clearModel(modals.tracks);
      $rootScope.openTracksModal = true;
      modalHelper.publish('showLoader', [modals.tracks]);
      spotify.getTracksByArtistID( item.id, (tracks) => {
        const model = getTracksModel(item, tracks);
        modalHelper.setModel(model);
        modalHelper.publish('hideLoader', [modals.tracks]);
      });
    } else if( item.type === 'album' ){
      modalHelper.clearModel(modals.tracks);
      $rootScope.openTracksModal = true;
      modalHelper.publish('showLoader', [modals.tracks]);
      spotify.getAlbumTracksByID( item.id, (tracks) => {
        const model = getTracksModel(item, tracks);
        modalHelper.setModel(model);
        modalHelper.publish('hideLoader', [modals.tracks]);
      });
    }
  };

});