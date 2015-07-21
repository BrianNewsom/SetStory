// Handles relations w/ mysql table artist_social_media in schema setstory
var settings = require('../config/settings');
var mysql = require('mysql');
var connection = mysql.createPool(settings.db.main);
var openaura = require('../apiHandlers/openaura');
var soundcloud = require('../apiHandlers/soundcloud');
var youtube = require('../apiHandlers/youtube');
var winston = require('winston');

var _ = require('lodash');
var artists = {};

artists.getByMBID = function(id, cb) {
  // Get an artist from their mb id
  connection.query('SELECT * FROM artists WHERE musicbrainz_id="'+id + '"', function(err, rows) {
        if (err){
        winston.error(err);
      }
      else{
          if (rows[0]){
            winston.info('fouund match w/ id');
            cb(rows[0]);
          } else {
            // No data -> No matching column - call openaura and get id
            winston.info('No artist with given id found in table artists');
            cb(null);
          }

      }

    });
};

artists.getMBIDByName = function(artistName, cb) {
  // Get mb id from artists table for a given artist name
  connection.query('SELECT * FROM artists WHERE artist="'+artistName + '"', function(err, rows) {
    if (err){
      winston.error(err);
    }
    else{
      if (rows[0]){
        winston.info('found match w/ name');
        winston.info(rows[0 ].musicbrainz_id);
        cb(rows[0 ].musicbrainz_id);
      } else {
        // No data -> No matching column - call openaura and get id
        winston.info('No artist with given name found in table artists');
        cb(null);
      }

    }

  });
};

artists.updateMBID = function(artistName, mbID, cb) {

  if(mbID == "openaura") {
    // Update musicbrainz_id for a given artist name
    openaura.getMBID(artistName, function(mbID){
      winston.debug("For " + artistName + " got mbid " + mbID);
      connection.query("UPDATE artists SET musicbrainz_id='" + mbID + "' WHERE artist='" + artistName + "'", function(err, rows){
        if(err) winston.error(err);
        else {
          cb(rows);
        }
      });
    })
  } else {
    connection.query("UPDATE artists SET musicbrainz_id='" + mbID + "' WHERE musicbrainz_id = NULL AND artist='" + artistName + "'", function(err, rows){
      if(err) winston.error(err);
      else {
        cb(rows);
      }
    });
  }
};

artists.updateFacebookLink = function(artistName, facebookLink, cb) {
  connection.query("UPDATE artists SET fb_link='" + facebookLink + "' WHERE fb_link IS NULL AND artist='" + artistName + "'", function(err, rows){
    if(err) winston.error(err);
    else {
      cb(rows, artistName);
    }
  });
}

artists.updateTwitterLink = function(artistName, twitterLink, cb) {
  connection.query("UPDATE artists SET twitter_link='" + twitterLink + "' WHERE twitter_link IS NULL AND artist='" + artistName + "'", function(err, rows){
    if(err) winston.error(err);
    else {
      cb(rows, artistName);
    }
  });
}

artists.updateInstagramID = function(artistName, instagramID, cb) {
  connection.query("UPDATE artists SET instagram_id='" + instagramID + "' WHERE instagram_id IS NULL AND artist='" + artistName + "'", function(err, rows){
    if(err) winston.error(err);
    else {
      cb(rows, artistName);
    }
  });
}

artists.updateSoundcloudLink = function(artistName, soundcloudLink, cb){
  connection.query("UPDATE artists SET soundcloud_link='" + soundcloudLink + "' WHERE soundcloud_link IS NULL AND artist='" + artistName + "'", function(err, rows){
    if(err) winston.error(err);
    else {
      cb(rows, artistName);
    }
  });
};

artists.updateYoutube = function(id, cb){
  // Update youtube info for given artist with musicbrainz id - id, and youtube channel name youtube_name.
  artists.getByMBID(id, function(artist){
    youtube.getChannelFromArtistName(artist.artist, function(youtube_channel) {
        if ( youtube_channel ) {
          winston.debug( youtube_channel )
          connection.query( "UPDATE artists " +
                            "SET youtube_link = ?, " +
                            "youtube_id = ? " +
                            "WHERE musicbrainz_id = ?;",
            [ 'https://www.youtube.com/user/' + youtube_channel.channelTitle, youtube_channel.channelId, id ],
            function( err, rows ) {
              if ( err ) {
                winston.info( "error in updating youtube" );
                winston.error( err );
                cb( null );
              }
              else {
                winston.info( "successfully updated youtube data for artist" );
                cb( rows );
              }
            } );
        }
        else {
          winston.info( 'No youtube channel found' );
          cb( null );
        }
    });
  });
};

module.exports = artists;

// TODO: Populate Musicbrainz_ids in artists table
//artists.forEach(function(row){
//  artists.updateMBID(row.artist, function(data){
//    winston.log(data);
//  })
//})


//artists.forEach = function(cb){
//  connection.query('SELECT * FROM artists', function(err, rows){
//    if(err) winston.log(err);
//    else {
//      _.forEach(rows, function(row) {
//          cb( row );
//      });
//    }
//  })
//};

//artists.updateSoundCloud('6461d3e3-2886-4ad4-90c9-a43e3202ebaf', function(data){
//  winston.log(data);
//})