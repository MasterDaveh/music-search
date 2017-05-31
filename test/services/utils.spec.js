describe('testing the utils factory', () => {
  let arrays = null;

  beforeEach(() => {
    module('base');
    module('utils');

    inject((_arrays_) => {
      arrays = _arrays_;
    });
  });

  it('should shuffle the passed array', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    let newArr = angular.copy( original );
    arrays.shuffle(newArr);
    console.log(original);
    console.log(newArr);
    let samePositionCount = 0;

    // counting how many elements are in the same position 
    // they were before the shuffling
    // (should not be more than 3)
    newArr.forEach((curr, i) => {
      if( curr === original[i] ){
        samePositionCount++;
      }
    });

    console.log('Elements in the same position', samePositionCount);
    expect(samePositionCount).toBeLessThan(4);
    
  });

});