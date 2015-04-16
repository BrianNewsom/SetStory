// Handles relations w/ mysql table artist_social_media in schema setstory
var settings = require('../config/settings');
var mysql = require('mysql');
var connection = mysql.createPool(settings.db.main);
var openaura = require('../apiHandlers/openaura.js');

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

artists.getIdByName = function(artistName, cb) {
  connection.query('SELECT * FROM artists WHERE artist="'+artistName + '"', function(err, rows) {
    if (err){
      console.log(err);
    }
    else{
      if (rows[0]){
        console.log('found match w/ name');
        cb(rows[0 ].musicbrainz_id);
      } else {
        // No data -> No matching column - call openaura and get id
        console.log('No artist with given name found in table artists');
        cb(null);
      }

    }

  });
};


//artists.addMBID = function(id, cb){
//
//}
module.exports = artists;