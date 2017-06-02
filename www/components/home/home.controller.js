const home = angular.module('home', ['spotifySrvc', 'modalHelper']);

home.controller('homeCtrl', function( $scope, $rootScope, spotify, modalHelper ){

  $scope.query = '';
  $scope.currentQuery = '';
  $scope.results = null;
  $scope.firstSearch = false;
  $scope.modalItems = [];
  $scope.modelChanged = false;

  $rootScope.openAllAlbumsModal = false;
  // $rootScope.openAllAlbumsModal = false;
  // $rootScope.openAllAlbumsModal = false;

  const allowedTypes = ['all_albums', 'top_tracks', 'album'];

  modalHelper.on('close', (modalId) => {
    $rootScope[modalId] = false;
  });

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
    return ['all_albums', 'top_tracks'].includes(result.type);
  }

  $scope.show = function (item) {
    if( !allowedTypes.includes(item.type) ) return;

    if( item.type === 'all_albums' ){
      spotify.getAlbumsByArtistID( item.id, (result) => {
        const model = {
          header: {
            pic: $scope.getPic(item),
            name: item.name
          }, 
          albums: result,
          modalId: 'openAllAlbumsModal'
        }
        modalHelper.setModel(model);
        $rootScope.openAllAlbumsModal = true;
      });
    } else if( item.type === 'top_tracks' ){
      spotify.getTracksByArtistID( item.id, (result) => {
      
      });
    } else if( item.type === 'album' ){
      spotify.getAlbumTracksByID( item.id, (result) => {

      });
    }
  };

  // TO BE REMOVED FOR PRODUCTION
  const runTest = () => {
    $scope.query = 'marshmello';
    $scope.search($scope.query);
  }
  runTest();

});