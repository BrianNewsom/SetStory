var rest = require('restler');
var _ = require('lodash');
var facebook = {};


facebook.getUser = function(user_id, cb){
    // Return all Facebook Page public data from a given user_id.

    rest.get('http://graph.facebook.com/' + user_id)
            .on('complete', function(data){
                cb(data);
    });
};

facebook.getLikesFromUserId = function(user_id, cb){
    // Return all Facebook Page public data from a given user_id.

    rest.get('http://graph.facebook.com/' + user_id)
            .on('complete', function(data){
                if(data.likes) {
                    cb(data.likes);
                } else {
                    cb(0);

                }
    });
};

facebook.getTalkingAboutFromUserId = function(user_id, cb){
    // Return all Facebook Page public data from a given user_id.

    rest.get('http://graph.facebook.com/' + user_id)
            .on('complete', function(data){
                cb(data.talking_about_count);
    });
};



module.exports = facebook;
