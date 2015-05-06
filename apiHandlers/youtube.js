var rest = require('restler');
var youtube = {};

youtube.key = 'AIzaSyDWyNgADlT_d1ZnBu0FzKK2Qo6KMTeiRIA';

youtube.getVideoStatsById = function(id, cb) {
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
  // TODO: There's lots of nice info in snippet if we want it
  rest.get( 'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&key=' + youtube.key + '&forUsername=' + name).on( 'complete', function( res ) {
    if ( res instanceof(Error) ) {
      console.log( JSON.stringify( res ) );
    }
    else {
      var stats = res.items[0 ].statistics;
      stats.channelName = name;
      stats.channelId = res.items[0 ].id;
      cb(res.items[0 ].statistics);
    }
  } )
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
