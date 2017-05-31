const home = angular.module('home', ['spotifySrvc']);

home.controller('homeCtrl', function( $scope, spotify ){

  $scope.query = '';
  $scope.results = null;
  $scope.firstSearch = false;

  $scope.search = (query) => {
    spotify.search( query, (results) => {
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
    spotify.searchMore($scope.query, (results) => {
      $scope.results.push( ...results );
    });
  }

  $scope.showBlurred = (result) => {
    return ['all_albums', 'all_tracks'].indexOf(result.type) > -1;
  }

  $scope.showAll = ( item ) => {
    const options = {
      queryArtists: item.artists || [{name: item.name}],
      albums: item.type === 'all_albums',
      tracks: item.type === 'all_tracks'
    }
    spotify.get(options, (result) => {
      console.log( result );
    });
  }

  // TO BE REMOVED FOR PRODUCTION
  const runTest = () => {
    $scope.query = 'twenty one';
    $scope.search($scope.query);
  }
  // runTest();

});