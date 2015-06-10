var rest = require('restler');
var async = require('async')
var _ = require('underscore')
var setmine = require('../apiHandlers/setmine')
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
    connection.query("SELECT booking_value FROM artists WHERE id = " + artistID, function(err, data) {
        if(err) console.log(err)
        else {
            callback(data)
        }
    } )
}

ava.calculateBookingValue = function(artistName, callback) {

}

module.exports = ava;
