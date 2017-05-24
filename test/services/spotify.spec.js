fdescribe('testing the spotify service', function(){
  let spotify;

  const searchTemplate = {
    albums: {
      items: [{ name: "Hell: The Sequel (Deluxe)", type: "album" }]
    }, artists: {
      items: [{ name: "Bad Meets Evil", type: "artist" }]
    }, tracks : {
      items: [{ name: "Fast Lane", type: "track" }]
    }
  };

  beforeEach(() => {
    module('base');
    module('spotifySrvc');

    // resolving dependancies
    inject((_spotify_) => {
      spotify = _spotify_;
    });
  });

  it('concatenated should be a combination of result.artists, result.tracks and result.albums', () => {
    const concatenated = spotify.concatenateResults( searchTemplate );
    expect( concatenated ).toContain({ name: "Hell: The Sequel (Deluxe)", type: "album" });
    expect( concatenated ).toContain({ name: "Bad Meets Evil", type: "artist" });
    expect( concatenated ).toContain({ name: "Fast Lane", type: "track" });
  });


});