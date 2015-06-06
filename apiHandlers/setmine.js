var rest = require('restler');
var setmine = {};
var api_key = 'sxsw2015';
var jf = require('jsonfile')
var cheerio = require('cheerio');
var request = require( 'request' );
var async = require( 'async' );
var _ = require('lodash')
var us = require('underscore')
var socialmedia = require('../models/socialmedia')

var settings = require('../config/settings');
var mysql = require('mysql');
var connection = mysql.createPool(settings.db.main);

var artists = []

setmine.artists = []
setmine.events = []
setmine.lineups = []


setmine.init = function(callback) {

    rest.get('http://setmine.com/api/v/7/artist', {
        query : {}
    }).on('complete', function(data) {
        setmine.artists = data.payload.artist;
        if(callback) {
            callback()
        }
    });

    rest.get('http://setmine.com/api/v/7/festival').on('complete', function(data) {
        setmine.events = data.payload.festival;
        //TODO: Hard fix for events
        setmine.events.push({
            id: '762',
            event:'EDC Las Vegas 2015'
        });
        if(callback) {
            callback()
        }
    });
}

setmine.getArtistByID = function(artistID, callback) {
	rest.get("http://setmine.com/api/v/7/artist/" + artistID).on('complete', function(response) {
		if(response.status == "success") {
            callback(response.payload.artist)
        }
	})
}

setmine.getArtistByName = function(artistName, callback) {
    rest.get("http://setmine.com/api/v/7/artist/" + artistName).on('complete', function(response) {
        if(response.status == "success") {
            callback(response.payload.artist)
        }
    })
}

setmine.getArtistPopularity = function(artist, callback) {
    setmine.getArtistByID(artist.id, function(artist) {
        callback(artist[0].popularity)
    })
}

setmine.getEventLineupByID = function(eventID, callback) {
    rest.get("http://setmine.com/api/v/7/lineup/" + eventID).on('complete', function(response) {
        if(response.status == "success") {
            callback(response.payload.lineup)
        }
    })
}

setmine.getEventLineupByName = function(eventName, callback) {

    var matchedEvent = us.findWhere(setmine.events, {event:eventName})

    if(matchedEvent) {
        setmine.getEventLineupByID(matchedEvent.id, function(lineup) {
            callback(lineup)
        })
    }
    else {
        callback()
    }
    
}


// First parameter 'data' must be an array with elements that look like this:
// {
//     "twitter_link": "https://twitter.com/Anonymuzkilla"
// }

setmine.socialmedia = socialmedia; // >> /models/socialmedia.js

module.exports = setmine;
