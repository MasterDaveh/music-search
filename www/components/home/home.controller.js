const home = angular.module('home', ['spotifySrvc', 'modalHelper']);

home.controller('homeCtrl', function( $scope, $rootScope, spotify, modalHelper ){

  $scope.query = '';
  $scope.currentQuery = '';
  $scope.results = null;
  $scope.firstSearch = false;
  $scope.modalItems = [];
  $scope.modelChanged = false;

  $rootScope.openAlbumsModal = false;
  $rootScope.openTracksModal = false;

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
      modalId: 'openTracksModal'
    };
  }

  const getAlbumsModel = (item, albums) => {
    return {
      header: {
        pic: $scope.getPic(item),
        name: item.name
      }, 
      albums,
      modalId: 'openAlbumsModal'
    };
  }

  $scope.search = (query) => {
    $scope.currentQuery = query;
    $scope.modelChanged = true;
    spotify.search( $scope.currentQuery, (results) => {
      $scope.results = spotify.normalize(results);
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
    spotify.searchMore($scope.currentQuery, (results) => {
      $scope.results.push( ...results );
    });
  }

  $scope.showBlurred = (result) => {
    return ['all_albums', 'top_tracks'].indexOf(result.type) > - 1;
  }

  $scope.show = function (item) {
    if( allowedTypes.indexOf(item.type) === -1 ) return;

    if( item.type === 'all_albums' ){
      spotify.getAlbumsByArtistID( item.id, (albums) => {
        const model = getAlbumsModel(item, albums);
        modalHelper.setModel(model);
        $rootScope.openAlbumsModal = true;
      });
    } else if( item.type === 'top_tracks' ){
      spotify.getTracksByArtistID( item.id, (tracks) => {
        const model = getTracksModel(item, tracks);
        modalHelper.setModel(model);
        $rootScope.openTracksModal = true;
      });
    } else if( item.type === 'album' ){
      spotify.getAlbumTracksByID( item.id, (tracks) => {
        const model = getTracksModel(item, tracks);
        modalHelper.setModel(model);
        $rootScope.openTracksModal = true;
      });
    }
  };

  // TO BE REMOVED FOR PRODUCTION
  const runTest = () => {
    $scope.query = 'cage the';
    $scope.search($scope.query);
  }
  // runTest();

});