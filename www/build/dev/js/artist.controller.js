'use strict';

angular.module('artist', ['modalHelper', 'ngAudio']).controller('artistCtrl', function ($scope, modalHelper, ngAudio, $interval) {

  $scope.model = [];
  $scope.showLoader = true;

  var songs = {};
  var _modalID = 'openArtistModal';
  var timer = null;

  modalHelper.on('reset', function (modalId) {
    if (_modalID === modalId) {
      var model = modalHelper.getModel();
      model.tracks.forEach(function (track, i) {
        track.playing = false;
        track.order = i;
      });
      $scope.model = model;
      $scope.model.tracks.forEach(function (track) {
        songs[track.id] = ngAudio.load(track.preview_url);
      });
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

  var stopAll = function stopAll() {
    $scope.model.tracks.forEach(function (track) {
      if (track.playing) {
        songs[track.id].pause();
        track.playing = false;
      }
    });
  };

  var getSong = function getSong(order, all) {
    var song = null;
    for (var songID in all) {
      if (all[songID].order === order + 1) {
        song = all[songID];
      }
    }
    return song;
  };

  var setProgress = function setProgress(track) {
    var progress = Math.round(songs[track.id].progress * 100);
    track.progress = progress;
    if (progress === 100) {
      var next = null;

      songs[track.id].progress = 0;
      $scope.pause(track);
    }
  };

  $scope.getPic = modalHelper.getPic;

  $scope.getTrackPic = function (track) {
    var pic = $scope.getPic(track.album);
    return pic;
  };

  $scope.close = function () {
    stopAll();
    modalHelper.publish('close', [$scope.model.modalId]);
  };

  $scope.play = function (track) {
    stopAll();
    songs[track.id].play();
    track.playing = true;
    setProgress(track);
    timer = $interval(function () {
      return setProgress(track);
    }, 100);
  };

  $scope.pause = function (track) {
    songs[track.id].pause();
    track.playing = false;
    $interval.cancel(timer);
  };
});