'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

// service to store data shared by controllers and open modals
angular.module('modalHelper', []).factory('modalHelper', function () {
  var model = {};
  var events = {
    reset: [],
    close: [],
    showLoader: [],
    hideLoader: [],
    clearModel: []
  };

  var setModel = function setModel(items) {
    model = items;
    publish('reset', [model.modalId]);
  };
  var getModel = function getModel() {
    return model;
  };
  var clearModel = function clearModel(modalId) {
    model = {};
    publish('clearModel', [modalId]);
  };
  var on = function on(evName, fn) {
    if (!events[evName]) {
      throw 'modalHelper: cannot subscribe to unknown \'' + evName + '\' event';
    }
    events[evName].push(fn);
  };

  var getPic = function getPic(result) {
    var pic = '',
        idx = 0;
    if (result.images.length > 1) {
      idx = result.images.length - 2;
    }
    pic = result.images[idx];
    return pic.url;
  };

  var publish = function publish(evName, args) {
    if (!events[evName]) {
      throw 'modalHelper: cannot publish unknown ' + evName + ' event';
    }
    events[evName].forEach(function (fn) {
      return fn.apply(undefined, _toConsumableArray(args));
    });
  };

  return { setModel: setModel, getModel: getModel, on: on, publish: publish, getPic: getPic, clearModel: clearModel };
});