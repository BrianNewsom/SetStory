var rest = require('restler');
var winston = require('winston');
var youtube = {};

youtube.key = 'AIzaSyDWyNgADlT_d1ZnBu0FzKK2Qo6KMTeiRIA';

youtube.getVideoStatsById = function(id, cb){
  // Get video stats for an individual video by id
  rest.get( 'https://www.googleapis.com/youtube/v3/videos?part=statistics&key=' + youtube.key + '&id=' + id).on( 'complete', function( res ) {
    if ( res instanceof(Error) ) {
      winston.error( JSON.stringify( res ) );
    }
    else {
      cb(res.items[0 ].statistics);
    }
  } )
}

youtube.getStatsForChannelByName = function(name, cb){
  // Get stats for a users channel by username (unique)
  // TODO: There's lots of nice info in snippet if we want it
  // TODO: Maybe it's better to have this as Id rather than name
  rest.get( 'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&key=' + youtube.key + '&forUsername=' + name).on( 'complete', function( res ) {
    winston.debug(res);
    if ( res instanceof(Error) || !res.items ) {
      winston.error( JSON.stringify( res ));
      cb(null);
    }
    else {
      var stats = res.items[0 ].statistics;
      stats.channelName = name;
      stats.channelId = res.items[0 ].id;
      cb(res.items[0 ].statistics);
    }
  } )
}

youtube.getStatsForChannelById = function(id, cb){
  // Get stats for a users channel by username (unique)
  // TODO: There's lots of nice info in snippet if we want it
  rest.get( 'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&key=' + youtube.key + '&id=' + id).on( 'complete', function( res ) {
    if ( res instanceof(Error) || !res.items ) {
      winston.error( JSON.stringify( res ) );
    }
    else {
      if(res.items[0]) {
        var stats = res.items[0].statistics;
        stats.channelId = res.items[0].id;
        cb(res.items[0].statistics);
      } else {
        cb()
      }
      
    }
  } )
}

youtube.getIdFromName = function(name, cb){
  // Get a Youtube Id from a username to populate table
  rest.get( 'https://www.googleapis.com/youtube/v3/channels?part=snippet&key=' + youtube.key + '&forUsername=' + name ).on('complete', function( res){
    if ( res instanceof(Error) ) {
      winston.error( JSON.stringify( res ) );
    }
    else {
      cb(res.items[0 ].id);
    }
  })
};

youtube.getChannelFromArtistName = function(name, cb){
  // Experimental feature to find a youtube channel id based on artist's name
  // Not to be trusted wholly, but should be accurate often.
  rest.get('https://www.googleapis.com/youtube/v3/search?part=snippet&key=' + youtube.key + '&type=channel' +
        '&q=' + name ).on('complete', function(res){
    if ( res instanceof(Error) || !res.items) { winston.error( JSON.stringify( res ) ); }
    else {
      // Give back top channel
      var channel = res.items[0];
      cb(channel.snippet);
    }
  })
}

module.exports = youtube;

/* Examples */
//youtube.getVideoStatsById('V2VmcuOEqEg', function(stats){
//    winston.log(stats);
//  });
//
//youtube.getStatsForChannelByName('TheOfficialSkrillex', function(data){
//  winston.log(data);
//});
//youtube.getIdFromName('TheOfficialSkrillex', function(data){
//  winston.log(data);
//});