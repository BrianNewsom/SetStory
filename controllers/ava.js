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
ava.version = 1

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
            console.log("setmine")

            if(matchedArtist) {
                setmine.getArtistPopularity(matchedArtist.id, function(popularity) {
                    callback(null, popularity)
                })
            } else {
                callback(null, 0)
            }

            
        },
        function(callback) {
            console.log("echonest")

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
        ava.calculateRaw(rawScores, function(rawAVAScore) {
            var roundedRawAVA = Math.floor(rawAVAScore)

            //Saves and timestamps the calculated booking value
            connection.query("INSERT INTO booking_values(artist_id, raw_score, ava_version) VALUES (?,?,?)", [matchedArtist.id, roundedRawAVA, ava.version], function(err, data) {
                if(err) console.log(err)
                else {
                    console.log(data)
                    supercallback({
                        artist_id: matchedArtist.id,
                        raw_score: roundedRawAVA,
                        ava_version: ava.version
                    })
                }
            })
        })
    })
}

ava.calculateRaw = function(rawNumbers, callback) {
    console.log("Setmine: " + rawNumbers.setmine)
    console.log("Echonest: ", rawNumbers.echonest)

    var rawAVAScore = ((.95*(rawNumbers.echonest.hotttnesss)) + (.05*(1/rawNumbers.echonest.hotttnesss_rank)))*100

    console.log("RAWAVA: " + rawAVAScore)
    callback(rawAVAScore)
}

ava.getSocialMedia = function(artistName, callback) {
    var matchedArtist = _.findWhere(setmine.artists, {artist: artistName})
    if(matchedArtist) {
        setmine.getSocialMediaMetrics(matchedArtist.id, function(response) {
            console.log(response)
            if(response.status == "success") {
                var artist = response.payload.artist
                var social = artist.social_media

                // Finds max value
                var followersOnly = _.pluck(_.values(social), 'followers')
                var maxSourceValue = _.max(_.values(followersOnly))

                // Generates social set
                var artistSocialSet = [];
                var index = 1;
                for(var prop in social) {
                    console.log(social[prop].followers)
                    artistSocialSet.push({
                        number: index,
                        value: (social[prop])? social[prop].followers : null,
                        name: prop,
                        max: maxSourceValue
                    });
                    index++
                }

                callback(artistSocialSet)
            } else {
                callback({error: "No Artist Found"})
            }
            
        })
    }
}

module.exports = ava;
