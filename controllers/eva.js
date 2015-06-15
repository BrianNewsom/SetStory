var rest = require('restler');
var async = require('async')
var _ = require('underscore')

var setmine = require('../apiHandlers/setmine')
var echonest = require('../apiHandlers/echonest')

var socialmedia = require('../models/socialmedia')

var artist_social_media = require('../controllers/artist_social_media');

var settings = require('../config/settings');
var mysql = require('mysql');
var connection = mysql.createPool(settings.db.main);

var eva = {}
eva.version = 1

eva.getLineupSocialMedia = function(lineupID, callback) {
    setmine.getLineupSocialMedia(lineupID, function(data) {
        var social_media = {
          twitter: 0,
          facebook: 0,
          instagram: 0,
          soundcloud: 0,
          youtube: 0
        }

        for(var i in data.payload.lineup) {
          var artist_social_media = data.payload.lineup[i].artist.artist_social_media
          if(artist_social_media.twitter) {
            social_media.twitter += artist_social_media.twitter.followers
          }
          if(artist_social_media.facebook) {
            social_media.facebook += artist_social_media.facebook.followers
          }
          if(artist_social_media.instagram) {
            social_media.instagram += artist_social_media.instagram.followers
          }
          if(artist_social_media.soundcloud) {
            social_media.soundcloud += artist_social_media.soundcloud.followers
          }
          if(artist_social_media.youtube) {
            social_media.youtube += artist_social_media.youtube.followers
          }
        }
        var maxSourceValue = _.max(_.values(social_media))
        var socialSet = [];
        socialSet.push({name: "facebook", max: maxSourceValue, value: social_media.facebook});
        socialSet.push({name: "twitter", max: maxSourceValue, value: social_media.twitter});
        socialSet.push({name: "instagram", max: maxSourceValue, value: social_media.instagram});
        socialSet.push({name: "youtube", max: maxSourceValue, value: social_media.youtube});
        socialSet.push({name: "soundcloud", max: maxSourceValue, value: social_media.soundcloud});
        
        callback(socialSet)
    })
}

eva.calculateLineupSocialMedia = function(lineupIDs, callback) {
  var lineup = []
  for(var i in lineupIDs) {
    var matchedArtist = _.findWhere(setmine.artists, {id: lineupIDs[i]}) // BUG only getting ids of new lineup artist
    if(matchedArtist) {
      lineup.push(matchedArtist)
    }
  }
  artist_social_media.updateLineupArtists(lineup, function(data) {
    callback(data)
  })
}
    
module.exports = eva;
