var socialmedia = {};
var cheerio = require('cheerio');
var request = require( 'request' );
var async = require( 'async' );
var _ = require('lodash');

var facebook = require('../apiHandlers/facebook')
var soundcloud = require('../apiHandlers/soundcloud')
var youtube = require('../apiHandlers/youtube')
var instagram = require('../apiHandlers/instagram')
var echonest = require('../apiHandlers/echonest')

var artists = require('../models/artists')

var settings = require('../config/settings');
var mysql = require('mysql');
var connection = mysql.createPool(settings.db.main);

// First parameter 'data' must be an array of Artist elements that look like this:
// {
//     "id": 1234,
//     "artist": "Diplo",
//     "twitter_link": "https://twitter.com/Anonymuzkilla",
// }

socialmedia.twitter = function(data, supercallback) {
    if(data.length > 200) {
        console.log("Rate limited at 200 objects with twitter links.")
        supercallback(data)
        return
    }
    // Get rid of elements (Artists) in the array that have NULL twitter links
    data = _.filter(data, function(artist) {
        if(!artist.artist_id) {
            artist['artist_id'] = artist.id
        }
        // Fetch twitter links from Echonest
        if(artist.twitter_link == null) {
            echonest.getTwitterLinkByArtist(artist.artist, function(twitterLink) {
                if(twitterLink) {
                    artist.twitter_link = twitterLink
                    // Run artist recursively through top-level social media function to cache data
                    socialmedia.twitter([artist], function(data) {
                        console.log("Twitter Data for artist '" + artist.artist + "' cached")
                    })
                    // Cache artist link
                    artists.updateTwitterLink(artist, artist.twitter_link, function(response, artistName) {
                        console.log("Twitter Link for artist '" + artistName + "' cached")
                    })
                } else {
                    console.log("Twitter Link for artist '" + artist.artist + "' not found.")
                }
            })
        } else {
            return artist.twitter_link
        }
    })
    var count = 0
    if(data.length == 0) {
        supercallback(data)
    } else {
        console.log("Fetching Twitter data for " + data.length + " artists...")
        async.whilst(
            function() { return count < data.length },
            function(callback) {
                getTwitterFollowers(data[count].twitter_link, function(followers) {
                    var followerCount = followers.substring(0, followers.indexOf("Followers") - 1)
                    var parsedFollowerCount = followerCount.replace(/\,/g,'')
                    data[count]['twitter_followers'] = parsedFollowerCount
                    count++
                    callback()
                })
            },
            function(err) {
                console.log("Twitter data received. Caching...")
                var sql = "INSERT INTO twitter_followers(artist_id, followers) VALUES (" + data[0].artist_id + "," + data[0].twitter_followers + ")"
                for(var i = 1; i < data.length; i++) {
                    sql += ",(" + data[i].artist_id + "," + data[i].twitter_followers + ")"
                }
                connection.query(sql, function(err, response) {
                    if(err) {
                        console.log("Error caching Twitter follower data.")
                        console.log(err)
                        supercallback(err)
                    }
                    else {
                        console.log("Twitter data cached.")
                        supercallback(data)
                    }
                })
            }
        )
    }
    

    function getTwitterFollowers(twitterlink, callback) {
        request(twitterlink, function(err, resp, body) {
            if (err) {
                console.log(err);
                callback("-")
            } else {
                var $ = cheerio.load(body);
                var twitterFollowersString = $(".ProfileNav-item--followers a.ProfileNav-stat").attr("title");
                callback(twitterFollowersString)
            }

            
        })
    }
}

socialmedia.facebook = function(data, supercallback) {
    if(data.length > 200) {
        console.log("Rate limited at 200 objects with facebook links.")
        supercallback(data)
        return
    }

    // Get rid of elements (Artists) in the array that have NULL facebook links
    data = _.filter(data, function(artist) {
        if(!artist.artist_id) {
            artist['artist_id'] = artist.id
        }
        // Fetch twitter links from Echonest
        if(artist.fb_link == null) {
            echonest.getFacebookLinkByArtist(artist.artist, function(facebookLink) {

                if(facebookLink) {
                    artist.fb_link = facebookLink

                    // Run artist recursively through top-level social media function to cache data
                    socialmedia.facebook([artist], function(data) {
                        console.log("Facebook Data for artist '" + artist.artist + "' cached")
                    })
                    // Cache artist link
                    artists.updateFacebookLink(artist.artist, artist.fb_link, function(response, artistName) {
                        console.log("Facebook Link for artist '" + artistName + "' cached")
                    })
                } else {
                    console.log("Facebook Link for artist '" + artist.artist + "' not found.")
                }

                
            })
        } else {
            return artist.fb_link
        }
    })

    var count = 0
    if(data.length == 0) {
        supercallback(data)
    } else {
        console.log("Fetching Facebook data for " + data.length + " artists...")
        async.whilst(
            function() { return count < data.length },
            function(callback) {
                if(data[count].fb_link.lastIndexOf("/") == data[count].fb_link.length - 1) {
                    data[count].fb_link = data[count].fb_link.substring(0, data[count].fb_link.length - 1)
                }
                var fb_user_id = data[count].fb_link.substring(data[count].fb_link.lastIndexOf("/") + 1, data[count].fb_link.length)
                facebook.getLikesFromUserId(fb_user_id, function(likes) {
                    data[count]['facebook_followers'] = likes
                    count++
                    callback()
                })
            },
            function(err) {
                console.log("Facebook data received. Caching...")
                var sql = "INSERT INTO facebook_followers(artist_id, followers) VALUES (" + data[0].artist_id + "," + data[0].facebook_followers + ")"
                for(var i = 1; i < data.length; i++) {
                    sql += ",(" + data[i].artist_id + "," + data[i].facebook_followers + ")"
                }
                connection.query(sql, function(err, response) {
                    if(err) {
                        console.log("Error caching Facebook likes data.")
                        console.log(err)
                        supercallback(err)
                    }
                    else {
                        console.log("Facebook likes data cached.")
                        supercallback(data)
                    }
                })
            }
        )
    }
}

socialmedia.instagram = function(data, supercallback) {

    if(data.length > 100) {
        console.log("Rate limited at 100 objects with instagram links.")
        supercallback(data)
        return
    }
    data = _.filter(data, function(artist) {
        if(!artist.artist_id) {
            artist['artist_id'] = artist.id
        }
        return artist.instagram_link != null
    })
    var count = 0
    if(data.length == 0) {
        supercallback(data)
    } else {
        console.log(data.length + " artists to fetch instagram data for...")
        async.whilst(
            function() { return count < data.length },
            function(callback) {
                console.log("Fetching instagram data for " + data[count].artist)
                // console.log("Fetching instagram data for ", data[count])

                if(data[count].instagram_id != null) {
                    instagram.getFollowersByUserId(data[count].instagram_id, function(followers) {
                        if(followers) {
                            data[count]['instagram_followers'] = followers
                            count++
                            callback()
                        } else {
                            data.shift(count)
                            callback()
                        }
                    })
                } else {

                    // Get name from instagram_link to search Instagram API for instagram_id
                    if(data[count].instagram_link.lastIndexOf("/") == data[count].instagram_link.length - 1) {
                        data[count].instagram_link = data[count].instagram_link.substring(0, data[count].instagram_link.length - 1)
                    }
                    var instagram_name = data[count].instagram_link.substring(data[count].instagram_link.lastIndexOf("/") + 1, data[count].instagram_link.length)

                    instagram.getIdFromName(instagram_name, function(id) {
                        // console.log("IG ID: ", id)
                        if(id) {
                            console.log("Instagram ID: "+id+" found. Caching and fetching followers.")
                            data[count].instagram_id = id
                            // Run artist recursively through top-level social media function to cache data
                            socialmedia.instagram([data[count]], function(response) {
                                // console.log("socialmedia.instagram response", response)
                                console.log("Instagram Data for artist cached")
                            })
                            artists.updateInstagramID(data[count].artist, data[count].instagram_id, function(rows, artistName) {
                                // console.log("artists.updateInstagramID response", rows)
                                console.log("Instagram ID for artist '" + artistName + "' cached")
                            })
                            data.shift(count)
                            callback()
                        } else {
                            // Remove artist if no instagram ID can be found
                            data.shift(count)
                            callback()
                        }
                    })
                }

                
            },
            function(err) {
                if(data.length == 0) {
                    console.log("No instagram data to cache.")
                    supercallback(data)
                } else {
                    var insertSQL = "INSERT INTO instagram_followers(artist_id, followers) VALUES (" + data[0].artist_id + "," + data[0].instagram_followers + ")"
                    for(var i = 1; i < data.length; i++) {
                      insertSQL += ",(" + data[i].artist_id + "," + data[i].instagram_followers + ")"
                    }
                    console.log(insertSQL)
                    connection.query(insertSQL, function(err, response) {
                        if(err) {
                            console.log("Error caching Instagram followers data.")
                            console.log(err)
                        }
                        else {
                            console.log("Instagram followers data cached.")
                        }
                        supercallback(data)
                    })
                }
            }
        )
    }
}

socialmedia.soundcloud = function(data, supercallback) {

    if(data.length > 200) {
        console.log("Rate limited at 200 objects with soundcloud links.")
        supercallback(data)
        return
    }
    data = _.filter(data, function(artist) {
        if(!artist.artist_id) {
            artist['artist_id'] = artist.id
        }
        return artist.soundcloud_link != null
    })
    var count = 0
    if(data.length == 0) {
        supercallback(data)
        return
    } else {
        console.log("Fetching Soundcloud data for " + data.length + " artists...")
        async.whilst(
            function() { return count < data.length },
            function(callback) {
                soundcloud.getUserFromPermalink(data[count].soundcloud_link, function(user){
                    soundcloud.getTotalPlays(user.id, function(plays){

                        data[count]['soundcloud_followers'] = user.followers_count
                        data[count]['soundcloud_plays'] = plays
                        data[count]['soundcloud_track_count'] = user.track_count

                        count++
                        callback()
                    });
                    
                });
            },
            function(err) {
                console.log("Soundcloud data received. Caching...")
                var followerSQL = "INSERT INTO soundcloud_followers(artist_id, followers) VALUES "

                if(data[0].soundcloud_followers) {
                    followerSQL += "(" + data[0].artist_id + "," + data[0].soundcloud_followers + "),"
                }
                for(var i = 1; i < data.length; i++) {
                    if(data[i].soundcloud_followers) {
                        followerSQL += "(" + data[i].artist_id + "," + data[i].soundcloud_followers + "),"
                    }
                }
                followerSQL = followerSQL.slice(0, -1)

                console.log(followerSQL)

                var playsSQL = "INSERT INTO soundcloud_media_plays(artist_id, plays, tracks) VALUES "

                if(data[0].soundcloud_track_count) {
                    playsSQL += "(" + data[0].artist_id + "," + data[0].soundcloud_plays + "," + data[0].soundcloud_track_count + "),"
                }
                for(var i = 1; i < data.length; i++) {
                    if(data[i].soundcloud_track_count) {
                        playsSQL += "(" + data[i].artist_id + "," + data[i].soundcloud_plays + "," + data[i].soundcloud_track_count + "),"
                    }
                }
                playsSQL = playsSQL.slice(0, -1)


                console.log(playsSQL)


                async.parallel([
                    function(callback) {
                        connection.query(followerSQL, function(err, response) {
                            if(err) {
                                console.log("Error caching Soundcloud followers data.")
                                console.log(err)
                                callback(null, err)
                            }
                            else {
                                console.log("Soundcloud followers data cached.")
                                callback(null, response)
                            }
                        })
                    },
                    function(callback) {
                        connection.query(playsSQL, function(err, response) {
                            if(err) {
                                console.log("Error caching Soundcloud media data.")
                                console.log(err)
                                callback(null, err)
                            }
                            else {
                                console.log("Soundcloud media data cached.")
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
}

socialmedia.youtube = function(data, supercallback) {
    if(data.length > 200) {
        console.log("Rate limited at 200 objects with youtube ids.")
        supercallback(data)
        return
    }
    data = _.filter(data, function(artist) {
        if(!artist.artist_id) {
            artist['artist_id'] = artist.id
        }
        return artist.youtube_id != null
    })
    var count = 0
    if(data.length == 0) {
        supercallback(data)
    } else {
        console.log("Fetching Youtube data for " + data.length + " artists...")
        async.whilst(
            function() { return (count < data.length) },
            function(callback) {
                youtube.getStatsForChannelById(data[count].youtube_id, function(stats) {
                    data[count]['youtube_followers'] = stats.subscriberCount
                    data[count]['youtube_plays'] = stats.viewCount
                    data[count]['youtube_videos'] = stats.videoCount
                    count++
                    callback()
                });
            },
            function(err) {
                console.log("Youtube data received. Caching...")

                var followerSQL = "INSERT INTO youtube_followers(artist_id, followers) VALUES (" + data[0].artist_id + "," + data[0].youtube_followers + ")"
                for(var i = 1; i < data.length; i++) {
                    followerSQL += ",(" + data[i].artist_id + "," + data[i].youtube_followers + ")"
                }

                var playsSQL = "INSERT INTO youtube_media_plays(artist_id, plays, videos) VALUES (" + data[0].artist_id + "," + data[0].youtube_plays + "," + data[0].youtube_videos + ")"
                for(var i = 1; i < data.length; i++) {
                    playsSQL += ",(" + data[i].artist_id + "," + data[i].youtube_plays + "," + data[i].youtube_videos + ")"
                }

                async.parallel([
                    function(callback) {
                        connection.query(followerSQL, function(err, response) {
                            if(err) {
                                console.log("Error caching Youtube followers data.")
                                console.log(err)
                                callback(null, response)
                            }
                            else {
                                console.log("Youtube followers data cached.")
                                callback(null, response)
                            }
                        })
                    },
                    function(callback) {
                        connection.query(playsSQL, function(err, response) {
                            if(err) {
                                console.log("Error caching Youtube media data.")
                                console.log(err)
                                callback(null, response)
                            }
                            else {
                                console.log("Youtube media data cached.")
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
    
}

module.exports = socialmedia;
