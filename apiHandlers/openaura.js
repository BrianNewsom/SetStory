var rest = require('restler');
var openaura = {};
var api_key = 'e92932b80a618686be74f8c720e39384ac04df55';
var _ = require('lodash');

openaura.getArtistImage = function(artist, cb){
    // Use decibel to get all genres for a given artist
    rest.get('http://api.openaura.com/v1/search/artists', {
        query : {'q' : artist, 'limit' : 1, 'api_key': api_key}}).on('complete', function(data){
        try {
            var oa_artist_id = data[0].oa_artist_id;
        rest.get('http://api.openaura.com/v1/classic/artists/' + oa_artist_id, {
            query: {'id_type' : 'oa:artist_id', 'api_key' : api_key }}).on('complete', function(data){
            cb(data.profile_image.url);
        })
        }
        catch(e){
            console.log(e);
            cb(null);
            return 1;
        }
    })
};

openaura.getSocialFeed = function(artist, limit, offset, cb){
    rest.get('http://api.openaura.com/v1/search/artists', {
        query : {'q' : artist, 'limit' : 1, 'api_key': api_key}}).on('complete', function(data){
            console.log(data)
        if(!data[0]){
            console.log('no artist found');
            cb(null);
            return 1;
        } else {
            var oa_artist_id = data[0].oa_artist_id;
            rest.get('http://api.openaura.com/v1/particles/artists/' + oa_artist_id, {
                // TODO: Get a particles api_key not jacked from their website example
                query: {'id_type' : 'oa:artist_id','limit' : limit, 'offset' : offset, 'api_key' : 'zlA809tV1FCxCb55n5ei0mSmbtHgvpJe' }}).on('complete', function(data){
                cb(data);
            })
        }

    })
};

var relevantMediaProviders = [ 'Twitter', 'Instagram', 'Facebook' ];


openaura.getFollowers = function( artist, cb ) {
  rest.get( 'http://api.openaura.com/v1/search/artists', {
    query: { 'q': artist, 'limit': 1, 'api_key': api_key }
  } ).on( 'complete', function( artists ) {
    try {
      var musicbrainz_id = artists[ 0 ].musicbrainz_id;
      rest.get( 'http://api.openaura.com/v1/source/artists/' + musicbrainz_id, {
        query: { 'id_type': 'musicbrainz:gid', 'api_key': api_key }
      } ).on( 'complete', function( basicSocialMediaData ) {
        // Extract data of type included in relevantMediaProviders.
        var sources = _.filter( basicSocialMediaData.sources, function( source ) {
          if ( source.name ) {
            // Only include if name matches to avoid fan groups.
            if ( source.name.toLowerCase() != artist.toLowerCase() ) {
              return false;
            }
          }
          return (_.contains( relevantMediaProviders, source.provider_name ));

        } );

        // Build output object
        var output = [];
        _.forEach( sources, function( source ) {
          // TODO: Determine what we actually want here
          var current = {};
          current.type = source.provider_name;
          current.followers = source.follower_count;
          current.url = source.url;
          current.thumbnail = source.profile_thumb_url;
          output.push( current );
        } )

        cb( output );
        return 0;

      } );
      //  cb(data.profile_image.url);
      //})
    }
    catch( e ) {
      console.log( e );
      cb( null );
      return 1;
    }
  } )
}


module.exports = openaura;