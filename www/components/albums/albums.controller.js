angular.module('albums', ['modalHelper'])

.controller('albumsCtrl', function($scope, modalHelper){

  $scope.model = [];
  $scope.showLoader = true;

  const _modalID = 'openAlbumsModal';

  modalHelper.on('reset', (modalId) => {
    if( _modalID === modalId ){
      $scope.model = modalHelper.getModel();
    }
  });

  modalHelper.on('showLoader', (modalId) => {
    if( _modalID === modalId ){
      $scope.showLoader = true;
    }
  });

  modalHelper.on('hideLoader', (modalId) => {
    if( _modalID === modalId ){
      $scope.showLoader = false;
    }
  });
  
  modalHelper.on('clearModel', (modalId) => {
    if( _modalID === modalId ){
      $scope.model = [];
    }
  });
  
  $scope.getPic = modalHelper.getPic;

  $scope.close = () => {
    modalHelper.publish('close', [$scope.model.modalId]);
  }
  
});