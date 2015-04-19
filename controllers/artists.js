// Handles relations w/ mysql table artist_social_media in schema setstory
var settings = require('../config/settings');
var mysql = require('mysql');
var connection = mysql.createPool(settings.db.main);
var openaura = require('../apiHandlers/openaura');
var _ = require('lodash');
var artists = {};

artists.getByMBID = function(id, cb) {
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

artists.forEach = function(cb){
  connection.query('SELECT * FROM artists', function(err, rows){
    if(err) console.log(err);
    else {
      _.forEach(rows, function(row) {
          cb( row );
      });
    }
  })
};


module.exports = artists;

// TODO: Populate Musicbrainz_ids in artists table
//artists.forEach(function(row){
//  artists.updateMBID(row.artist, function(data){
//    console.log(data);
//  })
//})