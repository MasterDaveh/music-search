angular.module('albums', ['modalHelper'])

.controller('albumsCtrl', function($scope, modalHelper){

  $scope.model = [];

  const _modalID = 'openAlbumsModal';

  modalHelper.on('reset', (modalId) => {
    if( _modalID === modalId ){
      $scope.model = modalHelper.getModel();
    }
  });
  
  $scope.getPic = modalHelper.getPic;

  $scope.close = () => {
    modalHelper.publish('close', [$scope.model.modalId]);
  }
  
});