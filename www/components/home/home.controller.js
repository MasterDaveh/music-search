const home = angular.module('home', ['spotifySrvc']);

home.controller('homeCtrl', function( $scope, spotify ){

  $scope.query = '';
  $scope.results = null;
  $scope.firstSearch = false;

  $scope.search = (query) => {
    spotify.search( query, (results) => {
      $scope.results = results;
    });
  };

  $scope.getPic = (result) => {
    let pic = '';
    // track
    if( !result.images ){
      pic = $scope.getPic(result.album);
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

  // TO BE REMOVED FOR PRODUCTION
  const runTest = () => {
    $scope.query = 'twenty one pilots';
    $scope.search($scope.query);
  }
  runTest();

});