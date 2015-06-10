var rest = require('restler');
var async = require('async')
var _ = require('underscore')

var setmine = require('../apiHandlers/setmine')
var echonest = require('../apiHandlers/echonest')

var socialmedia = require('../models/socialmedia')

var settings = require('../config/settings');
var mysql = require('mysql');
var connection = mysql.createPool(settings.db.main);

var ava = {}

// Gets last calculated value of the artist's booking value
// @param artist:
//      can be either the artist's Setmine ID or the artist name if it exists in Setmine artist models

ava.getBookingValue = function(artist, callback) {
    var artistID = artist;
    if(isNaN(artist)) {
        var matchedArtist = _.findWhere(setmine.artists, {artist: artistID}).id
        if(matchedArtist) {
            artistID = matchedArtist.id
        } else {
            callback()
            return
        }
    }
    connection.query("SELECT * FROM booking_values", function(err, data) {
        if(err) console.log(err)
        else {
            console.log(data)
            callback(data)
        }
    } )
}

ava.calculateBookingValue = function(artistName, supercallback) {
    var matchedArtist = _.findWhere(setmine.artists, {artist: artistName})
    async.parallel([
        function(callback) {
            setmine.getArtistPopularity(matchedArtist.id, function(popularity) {
                callback(null, popularity)
            })
        },
        function(callback) {
            echonest.getArtistPopularity(matchedArtist, function(popularity) {
                callback(null, popularity)
            })
        }
    ], function(err, results) {
        console.log(results)
        var rawScores = {
            setmine: results[0],
            echonest: results[1]
        }
        ava.algorithm(rawScores, function(rawAVAScore) {
            var roundedRawAVA = Math.floor(rawAVAScore)
            supercallback(roundedRawAVA)
        })
    })
}

ava.algorithm = function(rawNumbers, callback) {
    console.log("Setmine: " + rawNumbers.setmine)
    console.log("Echonest: " + rawNumbers.echonest)
    var rawAVAScore = 1 + (rawNumbers.setmine * rawNumbers.echonest);
    console.log("RAWAVA: " + rawAVAScore)
    callback(rawAVAScore)
}

module.exports = ava;
