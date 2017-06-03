angular.module('tracks', ['modalHelper'])

.controller('tracksCtrl', function($scope, modalHelper){

  $scope.model = [];
  $scope.showLoader = true;
  const _modalID = 'openTracksModal';

  modalHelper.on('reset', (modalId) => {
    if( _modalID === modalId ){
      const model = modalHelper.getModel()
      model.tracks.forEach((track) => {
        track.duration = moment.utc(track.duration_ms).format("m:ss")
      });
      $scope.showLoader = false;
      $scope.model = model;
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