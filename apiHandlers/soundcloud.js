var rest = require('restler');
var _ = require('lodash');
var soundcloud = {};
soundcloud.client_id = '66b598e554ce0083e7c7b55e983062b0';


soundcloud.getUserTracks = function(user_id, cb){
    // Return all tracks of a given user.  TODO: Check limit
    rest.get('http://api.soundcloud.com/users/' + user_id + '/tracks.json?client_id=' + soundcloud.client_id)
            .on('complete', function(data){
        cb(data);
    });
}

soundcloud.getTotalPlays = function(user_id, cb){
    soundcloud.getUserTracks(user_id, function(data){
        var total = 0;
        _.forEach(data, function(track){
            total += Number(track.playback_count);
        })
        cb(total);
    })
}

soundcloud.getUserFromPermalink = function(url, cb){
    rest.get('http://api.soundcloud.com/resolve?client_id=' + soundcloud.client_id + '&url=' + url).on('complete', function(user){
        cb(user);
    })
}

soundcloud.getUserFromPermalink('https://soundcloud.com/alt-j', function(user){
    var user_id = user.id;
    cb(user);
    soundcloud.getTotalPlays(user_id, function(plays){
        console.log(user.username + ' has ' + plays);
    });
});


module.exports = soundcloud;
