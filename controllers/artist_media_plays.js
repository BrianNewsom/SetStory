// Handles relations w/ mysql table artist_social_media in schema setstory
var settings = require('../config/settings');
var mysql = require('mysql');
var connection = mysql.createPool(settings.db.setstory);

var artist_media_plays = {};
var artists = require('../controllers/artists');

var youtube = require('../apiHandlers/youtube');
var soundcloud = require('../apiHandlers/soundcloud');

/* TODO For table

   Move soundcloud_id, url, youtube_id, youtube_url to another table
   Look up artist by musicbrainz_id in artists table, grab necessary data so we don't need it as an input.
   Then update using apiHandler functions

 */
artist_media_plays.updatePlays = function(soundcloud_url, youtube_channel, cb){
  console.log('updating plays for artist');
  soundcloud.getUserFromPermalink(soundcloud_url, function(user){
    var user_id = user.id;
    soundcloud.getTotalPlays(user_id, function(plays){
      var soundcloud_plays = plays;
      // Now get YT data
      youtube.getStatsForChannelByName(youtube_channel, function(youtube_stats){
        connection.query("INSERT INTO artist_media_plays SET soundcloud_url = ?, soundcloud_total_plays = ?, youtube_id = ?, youtube_url =?, youtube_total_plays = ?",
        [soundcloud_url, soundcloud_plays, youtube_stats.channelId, youtube_stats.channelName, youtube_stats.viewCount ], function(err, rows) {
            if (err) {
              console.log(err);
              cb(null);
            } else {
              cb("Successfully added data into table");
            }
          })
      })
    });
  });
}

module.exports = artist_media_plays;

//artist_media_plays.updatePlays('https://soundcloud.com/skrillex', 'TheOfficialSkrillex', function(res){
//  console.log(res);
//  return;
//})
