// Handles relations w/ mysql table artist_social_media in schema setstory
var settings = require('../config/settings');
var mysql = require('mysql');
var connection = mysql.createPool(settings.db.setstory);

var artist_media_plays = {};
var artists = require('../controllers/artists');

var youtube = require('../apiHandlers/youtube');
var soundcloud = require('../apiHandlers/soundcloud');


artist_media_plays.updatePlaysByMBId = function(musicbrainz_id, cb){
  // Update plays for an artist based on MBIDs (MUST HAVE ids in artists table)
  artists.getByMBID(musicbrainz_id, function(artist){
    artist_media_plays.updatePlays(musicbrainz_id, artist.soundcloud_id, artist.youtube_id, cb);
  })
};

artist_media_plays.updatePlays = function( musicbrainz_id, soundcloud_id, youtube_id, cb ) {
  // Update plays for a given artist based on ids
  console.log( 'updating plays for artist' );
  soundcloud.getTotalPlays( soundcloud_id, function( soundcloud_plays ) {
    youtube.getStatsForChannelById( youtube_id, function( youtube_stats ) {
      connection.query( "INSERT INTO artist_media_plays SET musicbrainz_id = ?, soundcloud_total_plays = ?, youtube_total_plays = ?",
        [ musicbrainz_id, soundcloud_plays, youtube_stats.viewCount ], function( err, rows ) {
          if ( err ) {
            console.log( err );
            cb( null );
          }
          else {
            cb( "Successfully added data into table" );
          }
        } )
    } )
  } )
};

/* Update plays for 3LAU */
//artist_media_plays.updatePlaysByMBId('6461d3e3-2886-4ad4-90c9-a43e3202ebaf', function(data){
//  console.log(data);
//})

  //soundcloud.getUserFromPermalink(soundcloud_url, function(user){
  //  var user_id = user.id;
  //  soundcloud.getTotalPlays(user_id, function(plays){
  //    var soundcloud_plays = plays;
  //    // Now get YT data
  //    youtube.getStatsForChannelByName(youtube_channel, function(youtube_stats){
  //      connection.query("INSERT INTO artist_media_plays SET soundcloud_url = ?, soundcloud_total_plays = ?, youtube_id = ?, youtube_url =?, youtube_total_plays = ?",
  //      [soundcloud_url, soundcloud_plays, youtube_stats.channelId, youtube_stats.channelName, youtube_stats.viewCount ], function(err, rows) {
  //          if (err) {
  //            console.log(err);
  //            cb(null);
  //          } else {
  //            cb("Successfully added data into table");
  //          }
  //        })
  //    })
  //  });
  //});


module.exports = artist_media_plays;

//artist_media_plays.updatePlays('https://soundcloud.com/skrillex', 'TheOfficialSkrillex', function(res){
//  console.log(res);
//  return;
//})
