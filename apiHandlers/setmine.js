var rest = require('restler');
var setmine = {};
var api_key = 'sxsw2015';
var jf = require('jsonfile')

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
    });

}

setmine.popularity = function(artist, event, callback) {
	console.log(artist)
	console.log(event)
	rest.get("http://setmine.com/api/v/5/search", {
		query: {
			search: artist + " " + event
		}}).on('complete', function(response) {
			callback(response)
		})

}

module.exports = setmine;
