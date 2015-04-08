// Handles relations w/ mysql table artist_social_media in schema setstory
var settings = require('../config/settings');
var mysql = require('mysql');
var connection = mysql.createPool(settings.db);

var artist_social_media = {};

artist_social_media.addArtist = function(data, cb) {
  connection.query("INSERT INTO artist_social_media SET name = ?, musicbrainz_id = ?, facebook_followers = ?, facebook_url = ?, twitter_followers = ?," +
                   " twitter_url = ?, instagram_followers = ?, instagram_url = ? ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id), name = ?, musicbrainz_id = " +
                   "?, facebook_followers = ?, facebook_url = ?, twitter_followers = ?, twitter_url = ?, instagram_followers = ?, instagram_url = ?",
    [data.name, data.musicbrainz_id, data.facebook_followers, data.facebook_url, data.twitter_followers, data.twitter_url, data.instagram_followers,
      data.instagram_url, data.name, data.musicbrainz_id, data.facebook_followers, data.facebook_url, data.twitter_followers, data.twitter_url,
      data.instagram_followers, data.instagram_url], function(err, rows) {
      if (err){
        console.log(err);
        return 1;
      }
      else{
        cb(rows);
        return 0;
      }

    });
}

artist_social_media.getArtist = function(id, id_type, cb) {
  var query = "SELECT * FROM artist_social_media WHERE ";
  // Default to setstory id
  query += (id_type) ? (id_type) : 'id';
  query += "='" + id + "'";
  connection.query(query, function( err, res ) {
      if ( err ) {
        console.log( err );
        return 1;
      }
      else {
        cb( res );
        return 0;
      }
  } );
}

module.exports = artist_social_media;
