// Handles relations w/ mysql table artist_social_media in schema setstory
var settings = require('../config/settings');
var mysql = require('mysql');
var connection = mysql.createPool(settings.db.main);
var openaura = require('../apiHandlers/openaura');
var soundcloud = require('../apiHandlers/soundcloud');
var youtube = require('../apiHandlers/youtube');

var _ = require('lodash');
var artists = {};

artists.getByMBID = function(id, cb) {
  // Get an artist from their mb id
  connection.query('SELECT * FROM artists WHERE musicbrainz_id="'+id + '"', function(err, rows) {
        if (err){
        console.log(err);
      }
      else{
          if (rows[0]){
            console.log('fouund match w/ id');
            cb(rows[0]);
          } else {
            // No data -> No matching column - call openaura and get id
            console.log('No artist with given id found in table artists');
            cb(null);
          }

      }

    });
};

artists.getMBIDByName = function(artistName, cb) {
  // Get mb id from artists table for a given artist name
  connection.query('SELECT * FROM artists WHERE artist="'+artistName + '"', function(err, rows) {
    if (err){
      console.log(err);
    }
    else{
      if (rows[0]){
        console.log('found match w/ name');
        console.log(rows[0 ].musicbrainz_id);
        cb(rows[0 ].musicbrainz_id);
      } else {
        // No data -> No matching column - call openaura and get id
        console.log('No artist with given name found in table artists');
        cb(null);
      }

    }

  });
};

artists.updateMBID = function(artistName, cb) {
  // Update musicbrainz_id for a given artist name
  openaura.getMBID(artistName, function(musicbrainz_id){
    console.log("For " + artistName + " got mbid " + musicbrainz_id);
    connection.query("UPDATE artists SET musicbrainz_id='" + musicbrainz_id + "' WHERE artist='" + artistName + "'", function(err, rows){
      if(err) console.log(err);
      else {
        cb(rows);
      }
    });
  })
};

artists.updateSoundCloud = function(id, cb){
  // Update soundcloud information for given musicbrainz_id
  artists.getByMBID(id, function(artist){
    soundcloud.getUserFromName(artist.artist, function(soundcloud_user){
      if(soundcloud_user){
      connection.query("UPDATE artists " +
                       "SET soundcloud_link = ?, " +
                            "soundcloud_id = ? " +
                            "WHERE musicbrainz_id= ?;",
        [ soundcloud_user.permalink_url, soundcloud_user.id, id],
        function(err, rows){
          if (err) {
            console.log("error in updating soundcloud");
            console.log(err);
            cb(null);
          }
          else {
            console.log("successfully updated soundcloud data for artist");
            cb(rows);
          }
      });
      } else {
        console.log("no soundcloud user found");
        cb(null);
      }

    });
  });
};

artists.updateYoutube = function(id, cb){
  // Update youtube info for given artist with musicbrainz id - id, and youtube channel name youtube_name.
  artists.getByMBID(id, function(artist){
    youtube.getChannelFromArtistName(artist.artist, function(youtube_channel) {
        if ( youtube_channel ) {
          console.log( youtube_channel )
          connection.query( "UPDATE artists " +
                            "SET youtube_link = ?, " +
                            "youtube_id = ? " +
                            "WHERE musicbrainz_id = ?;",
            [ 'https://www.youtube.com/user/' + youtube_channel.channelTitle, youtube_channel.channelId, id ],
            function( err, rows ) {
              if ( err ) {
                console.log( "error in updating youtube" );
                console.log( err );
                cb( null );
              }
              else {
                console.log( "successfully updated youtube data for artist" );
                cb( rows );
              }
            } );
        }
        else {
          console.log( 'No youtube channel found' );
          cb( null );
        }
    });
  });
};

module.exports = artists;

// TODO: Populate Musicbrainz_ids in artists table
//artists.forEach(function(row){
//  artists.updateMBID(row.artist, function(data){
//    console.log(data);
//  })
//})


//artists.forEach = function(cb){
//  connection.query('SELECT * FROM artists', function(err, rows){
//    if(err) console.log(err);
//    else {
//      _.forEach(rows, function(row) {
//          cb( row );
//      });
//    }
//  })
//};

//artists.updateSoundCloud('6461d3e3-2886-4ad4-90c9-a43e3202ebaf', function(data){
//  console.log(data);
//})