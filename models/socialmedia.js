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
var winston = require('winston');

// First parameter 'data' must be an array of Artist elements that look like this:
// {
//     "id": 1234,
//     "artist": "Diplo",
//     "twitter_link": "https://twitter.com/Anonymuzkilla",
// }

socialmedia.twitter = function(data, supercallback) {
    if(data.length > 200) {
        winston.warn("Rate limited at 200 objects with twitter links.")
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
                        winston.info("Twitter Data for artist '" + artist.artist + "' cached")
                    })
                    // Cache artist link
                    artists.updateTwitterLink(artist, artist.twitter_link, function(response, artistName) {
                        winston.info("Twitter Link for artist '" + artistName + "' cached")
                    })
                } else {
                    winston.info("Twitter Link for artist '" + artist.artist + "' not found.")
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
        winston.info("Fetching Twitter data for " + data.length + " artists...")
        async.whilst(
            function() { return count < data.length },
            function(callback) {
                getTwitterFollowers(data[count].twitter_link, function(followers) {
                    if(followers) {
                        var followerCount = followers.substring(0, followers.indexOf("Followers") - 1)
                        var parsedFollowerCount = followerCount.replace(/\,/g,'')
                        data[count]['twitter_followers'] = parsedFollowerCount
                        count++
                        callback()
                    } else {
                        data.splice(count, 1)
                        callback()
                    }
                    
                })
            },
            function(err) {
                winston.info("Twitter data received. Caching...")
                var sql = "INSERT INTO twitter_followers(artist_id, followers) VALUES (" + data[0].artist_id + "," + data[0].twitter_followers + ")"
                for(var i = 1; i < data.length; i++) {
                    sql += ",(" + data[i].artist_id + "," + data[i].twitter_followers + ")"
                }
                winston.debug(sql)
                connection.query(sql, function(err, response) {
                    if(err) {
                        winston.info("Error caching Twitter follower data.")
                        winston.error(err)
                        supercallback(err)
                    }
                    else {
                        winston.info("Twitter data cached.")
                        supercallback(data)
                    }
                })
            }
        )
    }
    

    function getTwitterFollowers(twitterlink, callback) {
        request(twitterlink, function(err, resp, body) {
            if (err) {
                winston.error(err);
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
        winston.warn("Rate limited at 200 objects with facebook links.")
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
                        winston.info("Facebook Data for artist '" + artist.artist + "' cached")
                    })
                    // Cache artist link
                    artists.updateFacebookLink(artist.artist, artist.fb_link, function(response, artistName) {
                        winston.info("Facebook Link for artist '" + artistName + "' cached")
                    })
                } else {
                    winston.info("Facebook Link for artist '" + artist.artist + "' not found.")
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
        winston.info("Fetching Facebook data for " + data.length + " artists...")
        async.whilst(
            function() { return count < data.length },
            function(callback) {
                if(data[count].fb_link.lastIndexOf("/") == data[count].fb_link.length - 1) {
                    data[count].fb_link = data[count].fb_link.substring(0, data[count].fb_link.length - 1)
                }
                var fb_user_id = data[count].fb_link.substring(data[count].fb_link.lastIndexOf("/") + 1, data[count].fb_link.length)
                facebook.getLikesFromUserId(fb_user_id, function(likes) {
                    if(likes) {
                        data[count]['facebook_followers'] = likes
                        count++
                        callback()
                    } else {
                        winston.debug(data[count].artist_id)
                        data.splice(count, 1)
                        callback()
                    }
                })
            },
            function(err) {
                winston.debug(data.length)

                if(data.length > 0) {
                    winston.info("Facebook data received. Caching...")
                    var sql = "INSERT INTO facebook_followers(artist_id, followers) VALUES (" + data[0].artist_id + "," + data[0].facebook_followers + ")"
                    for(var i = 1; i < data.length; i++) {
                        sql += ",(" + data[i].artist_id + "," + data[i].facebook_followers + ")"
                    }
                    winston.debug(sql)
                    connection.query(sql, function(err, response) {
                        if(err) {
                            winston.info("Error caching Facebook likes data.")
                            winston.error(err)
                            supercallback(err)
                        }
                        else {
                            winston.info("Facebook likes data cached.")
                            supercallback(data)
                        }
                    })
                } else {
                    winston.info("No facebook data to cache.")
                    supercallback(data)
                }
                
            }
        )
    }
}

socialmedia.instagram = function(data, supercallback) {

    if(data.length > 100) {
        winston.warn("Rate limited at 100 objects with instagram links.")
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
        winston.info(data.length + " artists to fetch instagram data for...")
        async.whilst(
            function() { return count < data.length },
            function(callback) {
                winston.info("Fetching instagram data for " + data[count].artist)
                // winston.log("Fetching instagram data for ", data[count])

                if(data[count].instagram_id != null) {
                    instagram.getFollowersByUserId(data[count].instagram_id, function(followers) {
                        if(followers) {
                            data[count]['instagram_followers'] = followers
                            count++
                            callback()
                        } else {
                            data.splice(count, 1)
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
                        // winston.log("IG ID: ", id)
                        if(id) {
                            winston.info("Instagram ID: "+id+" found. Caching and fetching followers.")
                            data[count].instagram_id = id
                            // Run artist recursively through top-level social media function to cache data
                            socialmedia.instagram([data[count]], function(response) {
                                // winston.log("socialmedia.instagram response", response)
                                winston.info("Instagram Data for artist cached")
                            })
                            artists.updateInstagramID(data[count].artist, data[count].instagram_id, function(rows, artistName) {
                                // winston.log("artists.updateInstagramID response", rows)
                                winston.info("Instagram ID for artist '" + artistName + "' cached")
                            })
                            data.splice(count, 1)
                            callback()
                        } else {
                            // Remove artist if no instagram ID can be found
                            data.splice(count, 1)
                            callback()
                        }
                    })
                }
                
            },
            function(err) {
                if(data.length == 0) {
                    winston.info("No instagram data to cache.")
                    supercallback(data)
                } else {
                    var insertSQL = "INSERT INTO instagram_followers(artist_id, followers) VALUES (" + data[0].artist_id + "," + data[0].instagram_followers + ")"
                    for(var i = 1; i < data.length; i++) {
                      insertSQL += ",(" + data[i].artist_id + "," + data[i].instagram_followers + ")"
                    }
                    winston.debug(insertSQL)
                    connection.query(insertSQL, function(err, response) {
                        if(err) {
                            winston.info("Error caching Instagram followers data.")
                            winston.error(err)
                        }
                        else {
                            winston.info("Instagram followers data cached.")
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
        winston.warn("Rate limited at 200 objects with soundcloud links.")
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
        winston.info("Fetching Soundcloud data for " + data.length + " artists...")
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
                winston.info("Soundcloud data received. Caching...")
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

                winston.debug(followerSQL)

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


                winston.debug(playsSQL)


                async.parallel([
                    function(callback) {
                        connection.query(followerSQL, function(err, response) {
                            if(err) {
                                winston.info("Error caching Soundcloud followers data.")
                                winston.error(err)
                                callback(null, err)
                            }
                            else {
                                winston.info("Soundcloud followers data cached.")
                                callback(null, response)
                            }
                        })
                    },
                    function(callback) {
                        connection.query(playsSQL, function(err, response) {
                            if(err) {
                                winston.info("Error caching Soundcloud media data.")
                                winston.error(err)
                                callback(null, err)
                            }
                            else {
                                winston.info("Soundcloud media data cached.")
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
        winston.warn("Rate limited at 200 objects with youtube ids.")
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
        winston.info("Fetching Youtube data for " + data.length + " artists...")
        async.whilst(
            function() { return (count < data.length) },
            function(callback) {
                youtube.getStatsForChannelById(data[count].youtube_id, function(stats) {
                    if(stats) {
                        data[count]['youtube_followers'] = stats.subscriberCount
                        data[count]['youtube_plays'] = stats.viewCount
                        data[count]['youtube_videos'] = stats.videoCount
                        count++
                        callback()
                    } else {
                        data.splice(count, 1)
                        callback()
                    }
                });
            },
            function(err) {
                winston.info("Youtube data received. Caching...")

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
                                winston.info("Error caching Youtube followers data.")
                                winston.error(err)
                                callback(null, response)
                            }
                            else {
                                winston.info("Youtube followers data cached.")
                                callback(null, response)
                            }
                        })
                    },
                    function(callback) {
                        connection.query(playsSQL, function(err, response) {
                            if(err) {
                                winston.info("Error caching Youtube media data.")
                                winston.error(err)
                                callback(null, response)
                            }
                            else {
                                winston.info("Youtube media data cached.")
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
