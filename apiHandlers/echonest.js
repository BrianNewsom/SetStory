var rest = require('restler');
var echonest = {};
var api_key= 'QQELH8UNTWLVBRQIB';
var consumer_key= '019584e62e8fca4752f9ee885d84c050';
var shared_secret= 'RwkQVo9ASH2dSIMlR7D4fg';

var artists = require("../models/artists")

echonest.getTrackPopularity = function(trackTitle, cb){
    // Use decibel to get all genres for a given artist
    rest.get('http://developer.echonest.com/api/v4/song/search', {
        query : {
            'title' : trackTitle,
            'format' : 'json',
            'api_key': api_key,
            'bucket': 'song_hotttnesss',
        }
    }).on('complete', function(data){
        console.log(data)
        cb(data)
    })
};

echonest.getArtistPopularity = function(artist, cb){
    // if(artist.musicbrainz_id) {
        var artist_id = artist.musicbrainz_id
        rest.get('http://developer.echonest.com/api/v4/artist/search/?' + 'api_key=' + api_key + '&format=json&name=' + artist.artist + '&bucket=hotttnesss&bucket=hotttnesss_rank&bucket=id:musicbrainz').on('complete', function(response){
            console.log("echonest complete")
            console.log(response)
            if(response.response.status.code != 0) {
                cb(0);
                return 1;
            } else {
                var artistResponse = response.response.artists[0]
                var popularity = {
                    hotttnesss: artistResponse.hotttnesss,
                    hotttnesss_rank: artistResponse.hotttnesss_rank,
                }
                if(artistResponse.foreign_ids) {
                    var mbID = artistResponse.foreign_ids[0].foreign_id.substring(artistResponse.foreign_ids[0].foreign_id.lastIndexOf(":") + 1)
                    console.log(mbID)
                    artists.updateMBID(artist.artist, mbID, function(rows) {
                        console.log(rows)
                        console.log("Artist " + artist.artist + " has been updated with Musicbrainz ID: " + mbID)
                    })
                }
                cb(popularity)
                return 0;
            }
            
        });
    // } else {
    //     rest.get('http://developer.echonest.com/api/v4/artist/search', {
    //         query : {
    //             "api_key": api_key,
    //             "name": artist.artist,
    //             "bucket": ["hotttnesss, hotttnesss_rank"]
    //         }
    //     }).on('complete', function(data){
    //         // Use matching artist's id to get popularity
    //         console.log(data)
    //         if (!data.response.artists[0]){
    //             cb(0);
    //             return 1;
    //         }
    //         else {
    //             var artist_id = data.response.artists[0].id;
    //             rest.get('http://developer.echonest.com/api/v4/artist/hotttnesss', {
    //                 query: {
    //                     "api_key" : api_key,
    //                     "id" : artist_id
    //                 }
    //             }).on('complete', function(artist_data){
    //                 if(!artist_data) {
    //                     cb(0);
    //                     return 1;
    //                 }
    //                 var popularity = artist_data.response.artist.hotttnesss;
    //                 cb(popularity)
    //                 return 0;
    //             });
    //         }
    //     })
    // }
    
}

module.exports = echonest;
