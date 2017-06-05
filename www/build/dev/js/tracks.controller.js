'use strict';

angular.module('tracks', ['modalHelper']).controller('tracksCtrl', function ($scope, modalHelper) {

  $scope.model = [];
  $scope.showLoader = true;
  var _modalID = 'openTracksModal';

  modalHelper.on('reset', function (modalId) {
    if (_modalID === modalId) {
      var model = modalHelper.getModel();
      model.tracks.forEach(function (track) {
        track.duration = moment.utc(track.duration_ms).format("m:ss");
      });
      $scope.showLoader = false;
      $scope.model = model;
    }
  });

  modalHelper.on('showLoader', function (modalId) {
    if (_modalID === modalId) {
      $scope.showLoader = true;
    }
  });

  modalHelper.on('hideLoader', function (modalId) {
    if (_modalID === modalId) {
      $scope.showLoader = false;
    }
  });

  modalHelper.on('clearModel', function (modalId) {
    if (_modalID === modalId) {
      $scope.model = [];
    }
  });

  $scope.getPic = modalHelper.getPic;

  $scope.close = function () {
    modalHelper.publish('close', [$scope.model.modalId]);
  };
});