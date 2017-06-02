describe('testing the concatenateResults and normalize methods', () =>{
  let spotify;

  const searchTemplate = {
    albums: {
      items: [{ name: "Hell: The Sequel (Deluxe)", type: "album" }, { name: "Hell: The Sequel (Deluxe) 2", type: "album" }]
    }, artists: {
      items: [{ name: "Bad Meets Evil", type: "artist" }, { name: "Bad Meets Evil 2", type: "artist" }]
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

  it('concatenated should be a combination of result.artists and result.albums', () => {
    const concatenated = spotify.concatenateResults( searchTemplate );
    expect( concatenated ).toContain({ name: "Hell: The Sequel (Deluxe) 2", type: "album" });
    expect( concatenated ).toContain({ name: "Bad Meets Evil 2", type: "artist" });
  });

  it('normalized should be an array with: best artist, best album, all albums placeholder, all tracks placeholder ', () => {
    const normalized = spotify.normalize( searchTemplate );
    expect(normalized[0]).toEqual({ name: "Bad Meets Evil", type: "artist" });
    expect(normalized[1]).toEqual({ name: "Hell: The Sequel (Deluxe)", type: "album" });
    expect(normalized[2].type).toEqual('all_albums');
    expect(normalized[3].type).toEqual('top_tracks');
  });

});