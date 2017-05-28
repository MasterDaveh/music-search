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

  // TEST
  $scope.search('eminem');

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

});