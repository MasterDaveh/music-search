'use strict';

angular.module('albums', ['modalHelper']).controller('albumsCtrl', function ($scope, modalHelper) {

  $scope.model = [];
  $scope.showLoader = true;

  var _modalID = 'openAlbumsModal';

  modalHelper.on('reset', function (modalId) {
    if (_modalID === modalId) {
      $scope.model = modalHelper.getModel();
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