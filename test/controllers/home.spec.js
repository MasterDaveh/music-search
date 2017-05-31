describe('homeCtrl', () => {

  let scope;

  const images = [
    {
      height: 640,
      url: "https://i.scdn.co/image/ed5dadc853f930d3d41eee7dbee3beae49cf9102",
      width: 640
    }, {
      height: 300,
      url: "https://i.scdn.co/image/e5a6766c732c4b8fd9115fcf52a41cc6a5b24fcf",
      width: 300
    }, {
      height: 64,
      url: "https://i.scdn.co/image/16b322461fc0ae674a2884792a5c67616cbecbcf",
      width: 64
    }
  ];

  beforeEach(() => {
    module('base');
    module('home');

    inject(($rootScope, $controller) => {
      scope = $rootScope.$new();
      $controller('homeCtrl', { $scope: scope });
    })
  });

  it('should return the second item', () => {
    expect( scope.getPic({ images }) ).toEqual( images[1].url );
  });

});