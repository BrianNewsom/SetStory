// Handles relations w/ mysql table artist_social_media in schema setstory
var settings = require('../config/settings');
var mysql = require('mysql');
var connection = mysql.createPool(settings.db.setstory);

var artist_social_media = {};
var artists = require('../controllers/artists');
var openaura = require('../apiHandlers/openaura');

artist_social_media.updateArtistById = function(musicbrainz_id, cb) {
  console.log("updating artist by id");
  openaura.getFollowers(musicbrainz_id, function(data){
    console.log(data);
    connection.query("INSERT INTO artist_social_media SET musicbrainz_id = ?, facebook_followers = ?, facebook_url = ?, twitter_followers = ?," +
                     " twitter_url = ?, instagram_followers = ?, instagram_url = ? ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id), musicbrainz_id = " +
                     "?, facebook_followers = ?, facebook_url = ?, twitter_followers = ?, twitter_url = ?, instagram_followers = ?, instagram_url = ?",
      [data.musicbrainz_id, data.facebook_followers, data.facebook_url, data.twitter_followers, data.twitter_url, data.instagram_followers,
        data.instagram_url, data.musicbrainz_id, data.facebook_followers, data.facebook_url, data.twitter_followers, data.twitter_url,
        data.instagram_followers, data.instagram_url], function(err, rows) {
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
  // TODO: Logic to update if results are too old
  var query = "SELECT * FROM artist_social_media WHERE ";
  // Default to setstory id
  query += (id_type) ? (id_type) : 'id';
  query += "='" + id + "'";
  connection.query(query, function( err, res ) {
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
  } );
}

module.exports = artist_social_media;


