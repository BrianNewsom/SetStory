var rest = require('restler');
var _ = require('lodash');
var soundcloud = {};
soundcloud.client_id = '66b598e554ce0083e7c7b55e983062b0';


soundcloud.getUserTracks = function(user_id, cb){
    // Return all tracks of a given user.
    // TODO: Stop getting rate limited :/
    rest.get('http://api.soundcloud.com/users/' + user_id + '/tracks.json?client_id=' + soundcloud.client_id)
            .on('complete', function(data){
        cb(data);
    });
}

soundcloud.getTotalPlays = function(user_id, cb){
    // Sum all plays across tracks for a given user
    soundcloud.getUserTracks(user_id, function(data){
        var total = 0;
        _.forEach(data, function(track){
            total += Number(track.playback_count);
        })
        cb(total);
    })
}

soundcloud.getUserFromPermalink = function(url, cb) {
    // Get a users info from soundcloud url
    rest.get('http://api.soundcloud.com/resolve?client_id=' + soundcloud.client_id + '&url=' + url).on('complete', function(user){
        cb(user);
    })
}

soundcloud.getUserFromName = function(name, cb){
    // Search users for 'name' and return first result's id
    rest.get('http://api.soundcloud.com/users.json?q=' + name + '&client_id=' + soundcloud.client_id).on('complete', function(user){
        cb(user[0 ].id);
    })
}

/* Examples */
//soundcloud.getUserFromName('Alt-J', function(data){
//    console.log(data);
//})
//
//soundcloud.getUserFromName('alt-j', function(user_id){
//    soundcloud.getTotalPlays(user_id, function(plays){
//        console.log(plays);
//    });
//});


module.exports = soundcloud;
