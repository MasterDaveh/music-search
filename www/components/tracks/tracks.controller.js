angular.module('tracks', ['modalHelper'])

.controller('tracksCtrl', function($scope, modalHelper){

  $scope.model = [];
  const _modalID = 'openTracksModal';

  modalHelper.on('reset', (modalId) => {
    if( _modalID === modalId ){
      $scope.model = modalHelper.getModel();
      $scope.model.tracks.forEach((track) => {
        track.duration = moment.utc(track.duration_ms).format("m:ss")
      });
    }
  });
  
  $scope.getPic = modalHelper.getPic;

  $scope.close = () => {
    modalHelper.publish('close', [$scope.model.modalId]);
  }
  
});