angular.module('artist', ['modalHelper', 'ngAudio'])

.controller('artistCtrl', function($scope, modalHelper, ngAudio, $interval){

  $scope.model = [];
  $scope.showLoader = true;

  const songs = {};
  const _modalID = 'openArtistModal';
  let timer = null;

  modalHelper.on('reset', (modalId) => {
    if( _modalID === modalId ){
      const model = modalHelper.getModel();
      model.tracks.forEach((track, i) => {
        track.playing = false
        track.order = i;
      });
      $scope.model = model;
      $scope.model.tracks.forEach((track) => {
        songs[track.id] = ngAudio.load(track.preview_url)
      });
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

  const stopAll = () => {
    $scope.model.tracks.forEach((track) => {
      if( track.playing ){
        songs[track.id].pause();
        track.playing = false;
      }
    });
  }

  const getSong = (order, all) => {
    let song = null;
    for( let songID in all ){
      if( all[songID].order === order + 1 ){
        song = all[songID];
      }
    }
    return song;
  }

  const setProgress = (track) => {
    const progress = Math.round(songs[track.id].progress * 100);
    track.progress = progress;
    if( progress === 100 ){
      let next = null;
      
      songs[track.id].progress = 0;
      $scope.pause(track);
    }
  }
  
  $scope.getPic = modalHelper.getPic;

  $scope.getTrackPic = (track) => {
    const pic = $scope.getPic( track.album );
    return pic;
  }

  $scope.close = () => {
    stopAll();
    modalHelper.publish('close', [$scope.model.modalId]);
  }

  $scope.play = ( track ) => {
    stopAll();
    songs[track.id].play();
    track.playing = true;
    setProgress(track);
    timer = $interval(() => setProgress(track), 100);
  }

  $scope.pause = ( track ) => {
    songs[track.id].pause();
    track.playing = false;
    $interval.cancel(timer);
  }
  
});