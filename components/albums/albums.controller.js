angular.module('albums', ['modalHelper'])

.controller('albumsCtrl', function($scope, modalHelper){

  $scope.model = [];

  modalHelper.on('reset', () => {
    $scope.model = modalHelper.getModel();
  });
  
  $scope.getPic = (result) => {
    let pic = '', idx = 0;
    if( result.images.length > 1 ){
      idx = result.images.length - 2;
    }
    pic = result.images[ idx ];
    return pic.url;
  }

  $scope.close = () => {
    modalHelper.publish('close', [$scope.model.modalId]);
  }
  
});