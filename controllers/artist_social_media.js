// Handles relations w/ mysql table relating to social media
var settings = require('../config/settings');
var async = require( 'async' );
var _ = require( 'underscore' );


var mysql = require('mysql');
var setstoryConnection = mysql.createPool(settings.db.setstory);
var mainConnection = mysql.createPool(settings.db.main);


var artist_social_media = {};
var artists = require('../models/artists');
var openaura = require('../apiHandlers/openaura');
var echonest = require('../apiHandlers/echonest');
var setmine = require('../apiHandlers/setmine')

artist_social_media.updateArtistByMusicbrainzID = function(musicbrainz_id, cb) {
  setstoryConnection = mysql.createPool(settings.db.setstory);
  openaura.getFollowers(musicbrainz_id, function(data){
    console.log(data);
    setstoryConnection.query("UPDATE artists SET musicbrainz_id = ?, fb_link = ?, twitter_link = ?, instagram_link = ?, soundcloud_link = ?, youtube_link = ?",
      [musicbrainz_id, data.facebook_link, data.twitter_link, data.instagram_link, data.soundcloud_link, data.youtube_link], function(err, rows) {
        if (err){
          console.log(err);
          cb(null);
        }
        else{
          // Success, give back the newly added data
          // TODO: Is this safe? We really want the data from the select
          cb(data);
        }
      });
  })
}

artist_social_media.updateArtistByName = function(artistName, cb){
  artists.getMBIDByName(artistName, function(musicbrainz_id){
    // TODO: Add this ID to artists table if it doesn't have it, or add a row if it doesn't exist
    console.log(musicbrainz_id);
    artist_social_media.updateArtistById(musicbrainz_id, cb)
  })
}

artist_social_media.getArtist = function(id, id_type, cb) {
  setstoryConnection = mysql.createPool(settings.db.setstory);

  var query = "SELECT * FROM artist_social_media WHERE ";
  // Default to setstory id
  query += (id_type) ? (id_type) : 'id';
  query += "='" + id + "'";

  // Get most recent data
  query += " ORDER BY timestamp DESC LIMIT 1"
  setstoryConnection.query(query, function( err, res ) {
      if ( err ) {
        console.log( err );
      }
      else {
        if(res[0] && res != []){
          console.log("Data pulled from artist_social_media successfully.");
          cb( res[0] );
        } else {
          // No matching data in table, use openaura to get data and add to table
          console.log("Pulling data from openaura");
          artist_social_media.updateArtistById(id, function(socialData){
            cb(socialData);
          })
        }
      }
  });
}

artist_social_media.getTwitterLink = function(artist, cb) {
  echonest.getFacebookAndTwitterLinks(artist)
  artists.updateFacebookLink(artist.artist, facebookID, function(rows) {

  })
  artists.updateTwitterLink(artist.artist, twitterID, function(rows) {
    
  })
}

artist_social_media.updateSetrecordsArtists = function(supercallback) {
  mainConnection.query("SELECT su.*, a.artist, a.twitter_link, a.fb_link, a.instagram_link, a.soundcloud_link, a.youtube_id, a.instagram_id FROM setrecords_users AS su INNER JOIN artists AS a ON a.id = su.artist_id", function(err, data) {
    async.parallel({
      twitter: function(callback) {
        setmine.socialmedia.twitter(data, function(data) {
          callback(null, data)
        })
      },
      facebook: function(callback) {
        setmine.socialmedia.facebook(data, function(data) {
            callback(null, data);
        })
      },
      instagram: function(callback) {
        setmine.socialmedia.instagram(data, function(data) {
            callback(null, data);
        })
      },
      soundcloud: function(callback) {
        setmine.socialmedia.soundcloud(data, function(data) {
          callback(null, data)
        })
      },
      youtube: function(callback) {
        setmine.socialmedia.youtube(data, function(data) {
            callback(null, data)
        })
      }
    }, function(err, results) {
      supercallback(results)
    })
    
  })
}

artist_social_media.updateDemoLineupArtists = function(supercallback) {
  setmine.getEventLineupByID(762, function(event) {
    console.log(event.lineup.length)
    var lineup = event.lineup
    async.parallel({
      twitter: function(callback) {
        setmine.socialmedia.twitter(lineup, function(data) {
          callback(null, data)
        })
      },
      facebook: function(callback) {
        setmine.socialmedia.facebook(lineup, function(data) {
            callback(null, data);
        })
      },
      instagram: function(callback) {
        setmine.socialmedia.instagram(lineup, function(data) {
            callback(null, data);
        })
      },
      soundcloud: function(callback) {
        setmine.socialmedia.soundcloud(lineup, function(data) {
          callback(null, data)
        })
      },
      youtube: function(callback) {
        setmine.socialmedia.youtube(lineup, function(data) {
            callback(null, data)
        })
      }
    }, function(err, results) {
      supercallback(results)
    })
    
  })
}

artist_social_media.updateLineupArtists = function(lineup, supercallback) {
  console.log(lineup[0])
  async.parallel({
    twitter: function(callback) {
      setmine.socialmedia.twitter(lineup, function(data) {
        callback(null, data)
      })
    },
    facebook: function(callback) {
      setmine.socialmedia.facebook(lineup, function(data) {
          callback(null, data);
      })
    },
    instagram: function(callback) {
      setmine.socialmedia.instagram(lineup, function(data) {
          callback(null, data);
      })
    },
    soundcloud: function(callback) {
      setmine.socialmedia.soundcloud(lineup, function(data) {
        callback(null, data)
      })
    },
    youtube: function(callback) {
      setmine.socialmedia.youtube(lineup, function(data) {
          callback(null, data)
      })
    }
  }, function(err, results) {
    supercallback(results)
  })
}


artist_social_media.updateSocialMetricsByName = function(artistName, supercallback) {
  var artist = _.findWhere(setmine.artists, {artist: artistName})
  console.log(artist)
  async.parallel({
    twitter: function(callback) {
      setmine.socialmedia.twitter([artist], function(data) {
        callback(null, data)
      })
    },
    facebook: function(callback) {
      setmine.socialmedia.facebook([artist], function(data) {
          callback(null, data);
      })
    },
    instagram: function(callback) {
      setmine.socialmedia.instagram([artist], function(data) {
          callback(null, data);
      })
    },
    soundcloud: function(callback) {
      setmine.socialmedia.soundcloud([artist], function(data) {
        callback(null, data)
      })
    },
    youtube: function(callback) {
      setmine.socialmedia.youtube([artist], function(data) {
          callback(null, data)
      })
    }
  }, function(err, results) {
    supercallback(results)
  })
}


module.exports = artist_social_media;


