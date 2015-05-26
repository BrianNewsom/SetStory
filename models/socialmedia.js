var socialmedia = {};
var cheerio = require('cheerio');
var request = require( 'request' );
var async = require( 'async' );
var soundcloud = require('../apiHandlers/soundcloud')


var settings = require('../config/settings');
var mysql = require('mysql');
var connection = mysql.createPool(settings.db.main);

// First parameter 'data' must be an array with elements that look like this:
// {
//     "twitter_link": "https://twitter.com/Anonymuzkilla"
// }

socialmedia.twitter = function(data, supercallback) {
    if(data.length > 100) {
        console.log("Rate limited at 100 objects with twitter links.")
        supercallback(data)
        return
    }
    console.log(data)
    var count = 0
    async.whilst(
        function() { return count < data.length },
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
                    supercallback(data)
                }
            })
        }
    )

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

socialmedia.instagram = function(data, callback) {

    // TODO refactor for instagram

    function getInstagramFollowers(instagramlink, callback) {
        request(instagramlink, function(err, resp, body) {
            if (err) {
                console.log(err);
                callback("-")
            } else {
                var $ = cheerio.load(body);

                var instagramFollowersString = $(".ProfileNav-item--followers a.ProfileNav-stat").attr("title");
                console.log(instagramFollowersString)
                callback(instagramFollowersString)
            }

            
        })
    }
}

socialmedia.soundcloud = function(data, supercallback) {

    if(data.length > 100) {
        console.log("Rate limited at 100 objects with soundcloud links.")
        supercallback(data)
        return
    }
    console.log(data)
    var count = 0
    async.whilst(
        function() { return count < data.length },
        function(callback) {
            soundcloud.getUserFromName(data[count].username, function(user){
                console.log(user)
                soundcloud.getTotalPlays(user.id, function(plays){
                   data[count]['soundcloud_followers'] = user.followers_count
                   data[count]['soundcloud_plays'] = plays
                   data[count]['soundcloud_track_count'] = user.track_count

                   console.log(data[count]['soundcloud_followers'])
                   console.log(data[count]['soundcloud_plays'])
                   console.log(data[count]['soundcloud_track_count'])

                   count++
                   callback()
               });
            });
        },
        function(err) {
            console.log("Done")
            var followerSQL = "INSERT INTO soundcloud_followers(artist_id, followers) VALUES (" + data[0].artist_id + "," + data[0].soundcloud_followers + ")"
            for(var i = 1; i < data.length; i++) {
                followerSQL += ",(" + data[i].artist_id + "," + data[i].soundcloud_followers + ")"
            }
            console.log(followerSQL)

            var playsSQL = "INSERT INTO soundcloud_media_plays(artist_id, plays) VALUES (" + data[0].artist_id + "," + data[0].soundcloud_plays + ")"
            for(var i = 1; i < data.length; i++) {
                playsSQL += ",(" + data[i].artist_id + "," + data[i].soundcloud_plays + ")"
            }
            console.log(playsSQL)

            var trackSQL = "INSERT INTO soundcloud_track_counts(artist_id, count) VALUES (" + data[0].artist_id + "," + data[0].soundcloud_track_count + ")"
            for(var i = 1; i < data.length; i++) {
                trackSQL += ",(" + data[i].artist_id + "," + data[i].soundcloud_track_count + ")"
            }
            console.log(trackSQL)

            async.parallel([
                function(callback) {
                    connection.query(followerSQL, function(err, response) {
                        if(err) console.log(err)
                        else {
                            console.log(response)
                            callback(null, response)
                        }
                    })
                },
                function(callback) {
                    connection.query(playsSQL, function(err, response) {
                        if(err) console.log(err)
                        else {
                            console.log(response)
                            callback(null, response)

                            
                        }
                    })
                },
                function(callback) {
                    connection.query(trackSQL, function(err, response) {
                        if(err) console.log(err)
                        else {
                            console.log(response)
                            callback(null, response)
                        }
                    })
                }
            ], function(err, results) {
                supercallback(data)
            })

            
        }
    )
}



module.exports = socialmedia;
