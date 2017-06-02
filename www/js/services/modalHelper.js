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
    publish('reset');
  };
  const getModel = () => model;
  const on = (evName, fn) => {
    if( !events[evName] ){
      throw `modalHelper: cannot subscribe to unknown '${ evName }' event`;
    }
    events[evName].push( fn );
  }

  const publish = ( evName, args ) => {
    events[evName].forEach((fn) => fn( args ));
  }
  
  return { setModel, getModel, on, publish }

});