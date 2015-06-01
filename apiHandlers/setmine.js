var rest = require('restler');
var setmine = {};
var api_key = 'sxsw2015';
var jf = require('jsonfile')
var echonest = require('./echonest.js')

var artists = []

setmine.artists = []

setmine.init = function(callback) {

    rest.get('http://setmine.com/api/v/7/artist', {
        query : {}
    }).on('complete', function(data) {
        setmine.artists = data.payload.artist;
        //TODO: Hard fix for events
        setmine.artists.push({artist:'Coachella 2015'});
        setmine.artists.push({artist:'Lollapalooza 2015'});
        setmine.artists.push({artist:'Ultra Music Festival 2015'});
        setmine.artists.push({artist:'SXSW 2015'});
        if(callback) {
            callback()
        }
    })

}

setmine.popularity = function(artist, callback) {
	console.log(artist)
	rest.get("http://setmine.com/api/v/7/artist", {
		query: {
			search: artist
		}}).on('complete', function(response) {
			callback(response)
		})

}

setmine.getAVAScore = function(artistName, callback) {
    console.log("getavascore function")
    console.log(artistName)
    var setmine_play_counts;
    var echnonest_artist_popularity;

    echonest.getArtistPopularity(artistName, function(data) {
        console.log(data);
        var artistData = data;
        echonest_artist_popularity = data.popularity


        setmine.popularity(artistName, function(setmineResponse){
            console.log(setmineResponse);

            setmine_play_counts = setmineResponse.payload.artist.popularity || 100;


            var score = setmine_play_counts + echonest_artist_popularity;
            var data = {
             artist: artistName,
             ava_score: score
            }
            callback(data)


        })

   
        
    })

   
}

module.exports = setmine;
