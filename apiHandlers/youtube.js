var rest = require('restler');
var youtube = {};

youtube.key = 'AIzaSyDWyNgADlT_d1ZnBu0FzKK2Qo6KMTeiRIA';

youtube.getVideoStatsById = function(id, cb){
  // Get video stats for an individual video by id
  rest.get( 'https://www.googleapis.com/youtube/v3/videos?part=statistics&key=' + youtube.key + '&id=' + id).on( 'complete', function( res ) {
    if ( res instanceof(Error) ) {
      console.log( JSON.stringify( res ) );
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
    console.log(res);
    if ( res instanceof(Error) || !res.items ) {
      console.log( JSON.stringify( res ));
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
      console.log( JSON.stringify( res ) );
    }
    else {
      var stats = res.items[0].statistics;
      stats.channelId = res.items[0 ].id;
      cb(res.items[0 ].statistics);
    }
  } )
}

youtube.getIdFromName = function(name, cb){
  // Get a Youtube Id from a username to populate table
  rest.get( 'https://www.googleapis.com/youtube/v3/channels?part=snippet&key=' + youtube.key + '&forUsername=' + name ).on('complete', function( res){
    if ( res instanceof(Error) ) {
      console.log( JSON.stringify( res ) );
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
    if ( res instanceof(Error) || !res.items) { console.log( JSON.stringify( res ) ); }
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
//    console.log(stats);
//  });
//
//youtube.getStatsForChannelByName('TheOfficialSkrillex', function(data){
//  console.log(data);
//});
//youtube.getIdFromName('TheOfficialSkrillex', function(data){
//  console.log(data);
//});