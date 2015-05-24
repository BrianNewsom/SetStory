var rest = require('restler');
var setmine = {};
var api_key = 'sxsw2015';
var jf = require('jsonfile')
var cheerio = require('cheerio');
var request = require( 'request' );
var async = require( 'async' );
var _ = require('lodash')

var settings = require('../config/settings');
var mysql = require('mysql');
var connection = mysql.createPool(settings.db.main);

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

setmine.socialmedia = function(artistsWithTwitterLinks, callback) {
    connection.query("SELECT su.artist_id, a.artist, a.twitter_link FROM setrecords_users AS su "+
        "INNER JOIN artists AS a ON a.id = su.artist_id "+
        "WHERE twitter_link != \"https://twitter.com/SetMineApp\" AND twitter_link != \"https://twitter.com/Stredm_Music\"", function(err, data) {
            var data = artistsWithTwitterLinks
            if(data.length > 100) {
                console.log("Number of artists must be less then 100")
                callback(data)
                return
            }
            console.log(data)
            var count = 0
            async.whilst(
                function() { return count < data.length},
                function(callback) {
                    getTwitterFollowers(data[count].twitter_link, function(followers) {
                        var followerCount = followers.substring(0, followers.indexOf("Followers") - 1)
                        var parsedFollowerCount = followerCount.replace(/\,/g,'')
                        data[count]['twitter_followers'] = parsedFollowerCount
                        console.log(data[count]['twitter_followers'])
                        count++
                        callback()
                    })
                },
                function(err) {
                    console.log("Done")
                    var sql = "INSERT INTO twitter_followers(artist_id, followers) VALUES (" + data[0].artist_id + "," + data[0].twitter_followers + ")"
                    for(var i = 1; i < data.length; i++) {
                        sql += ",(" + data[i].artist_id + "," + data[i].twitter_followers + ")"
                    }
                    console.log(sql)
                    connection.query(sql, function(err, response) {
                        if(err) console.log(err)
                        else {
                            console.log(response)
                            callback(data)
                        }
                    })
                }
            )
    })

    function getTwitterFollowers(twitterlink, callback) {
        request(twitterlink, function(err, resp, body) {
            if (err) {
                console.log(err);
                callback("-")
            } else {
                var $ = cheerio.load(body);

                var twitterFollowersString = $(".ProfileNav-item--followers a.ProfileNav-stat").attr("title");
                console.log(twitterFollowersString)
                callback(twitterFollowersString)
            }

            
        })
    }
    
}

module.exports = setmine;
