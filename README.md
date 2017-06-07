# `Music Search`
> Search for your favorite music leveraging the phenomenal [Spotify Web API](https://developer.spotify.com/web-api/).<br>

This is a project I made as a test for a company, so I'll be describing more in depth my solution below.

# Initial considerations
I chose to add pug as an HTML preprocessor because of its ability to include external templates easily and the simplicity and straighforwardness of the syntax. As a task runner I went with Gulp over others because I found its syntax easier to reason about than, say, the huge configuration of Grunt files.

# Design
I followed [this](https://invis.io/XVAJ2MMK7) design as a reference.<br>
Flexbox has been my weapon of choice here, because of its practicality and favorable [browser support](http://caniuse.com/#search=flexbox).

### Home page
In the home page are mainly displayed the search results. I had to make a couple of assumptions as to what type of content those results actually included and how they were arranged on the page. <br>
I had a couple of options to play with. The first one I tried was to just display artists, albums and tracks together. 
Then I realized I wouldn't have an icon to use in order to distinguish the tracks from the albums, since I only had a record and an avatar available, and in the design only these two are used, so I figured I would display just artists and albums, relegating details inside the modals.<br>
The next assumption I had to make was regarding the two upmost cards in the design, the blurry ones with the record player icon. 
Initially I hadn't quite understood the content these two cards should hold, so I thought I would relate them to the first two cards. 
I tweaked a bit my results and showed in the first two positions the best artist and album matches for the search, respectively, and in the blurry cards all the albums and the best tracks of the artist I chose in the first card.<br>

#### Mobile
I chose to include the blurry cards even though they are not displayed in the original design, because they hold critical information that would be missed on mobile. 
I tweaked a bit the positioning of the "search" and the "show me more!" buttons also. Here's a side-by-side comparison of what I did, my solution is on the left.
<div style="display: flex; justify-content: center; margin-bottom: 20px">
  <img style="margin-right: 20px" src="http://masterdave.altervista.org/music-search-assets/mobile-results-2.png">
  <img src="http://masterdave.altervista.org/music-search-assets/mobile-results-2-original.png">
</div>
<div style="display: flex; justify-content: center;">
  <img style="margin-right: 20px" src="http://masterdave.altervista.org/music-search-assets/mobile-results.png">
  <img src="http://masterdave.altervista.org/music-search-assets/mobile-results-original.png">
</div>

In both instances I emphasized the grouping of the elements to establish a clearer hierarchy; in the first layout I placed the search bar and search button closer together and a bit more far away from the rest, to clearly define that these elements are part of a single group. 
With the same idea in mind I placed the "show me more!" button closer to the cards in the second layout, as the action of requesting more results is related more to the current results than to the information displayed in the footer.<br>

### Modals
The data displayed in the modals are artist's albums, album's tracks and artist's tracks. I chose to emphasize again the grouping of the elements so that it's crystal clear, especially on mobile, where the boundaries of a list item are.<br>
I chose to make the list displayed scrollable and keep the pic and the details on the header always visible. This is especially useful when you are doing something along the lines of "I'm checking out a new artist's songs, so I scroll through them. Wait, how was the artist called?" and then you would have to scroll back up.<br>
I chose to immediately display the modals, even if the data is not yet available, to give the illusion of the website running faster and to display a loader in the meantime, so that the user knows the website is processing data and had not hung somewhere.

# Business logic
The bulk of the code is in the home controller, where I mainly perform the search from the home page.
The interactions with the Spotify API are abstracted in a service, and I pass data to the modals using a helper service whose only role is to store and pass data.
The service is linked to the other controllers using a PubSub pattern, so controllers subscribe to events on the service and other controllers can fire events which call the subscribed controllers.<br>
During the development the spotify APIs suddenly required to have an authorization key to access them, so I included an `authorize` method in the spotify service, to handle it. All that is masked by a login process, which is only required to retrieve an access token in order to call the Spotify endpoints.

### Testing and serving
If you'd like to test the project locally just clone the repo, run `npm install` and `bower install` to install the dependencies and run `gulp`. This will transpile the js, compile the SASS and spin up a local server at `http://localhost:3000`, serving the website in DEV mode.<br>
If you want to test the project with a production setup just set the `env` var to 'PROD' in the index.pug file, then run `gulp build` and finally `gulp`. 
This will tell pug to look for the styles and scripts in the production folder, then transpile, minify and concatenate the js, compile the SASS and move all those files in the production folder.<br>
Finally, if you'd like to run the tests included run `gulp test`;

# Final notice
If you find bugs feel free to open an issue and/or send a pull request. <br>
If you feel something is not clear, or the documentation needs to be updated just DM me on [Twitter][#masterdave-twitter] or [Facebook][#masterdave-fb]

[#masterdave-twitter]:  https://twitter.com/masterdaveh
[#masterdave-fb]:       https://www.facebook.com/davide.vico.5