// service to store data shared by controllers and open modals
angular.module('modalHelper', [])

.factory('modalHelper', function(){
  let model = {};
  const events = {
    reset: [],
    close: []
  };

  const setModel = (items) => {
    model = items;
    publish('reset', [model.modalId]);
  };
  const getModel = () => model;
  const on = (evName, fn) => {
    if( !events[evName] ){
      throw `modalHelper: cannot subscribe to unknown '${ evName }' event`;
    }
    events[evName].push( fn );
  }

  const getPic = (result) => {
    let pic = '', idx = 0;
    if( result.images.length > 1 ){
      idx = result.images.length - 2;
    }
    pic = result.images[ idx ];
    return pic.url;
  }

  const publish = ( evName, args ) => {
    events[evName].forEach((fn) => fn( ...args ));
  }
  
  return { setModel, getModel, on, publish, getPic }

});