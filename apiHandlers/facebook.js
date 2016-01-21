var rest = require('restler');
var _ = require('lodash');
var winston = require('winston');
var facebook = {};
var access_token = "648288801959503|zBfy5bYJULQIfru7N5P3jqtw4mk";


facebook.getUser = function(user_id, cb){
    // Return all Facebook Page public data from a given user_id.

    rest.get('https://graph.facebook.com/v2.3/' + user_id + "?access_token=" + access_token)
            .on('complete', function(data){
                cb(data);
    });
};

facebook.getLikesFromUserId = function(user_id, cb){
    rest.get('https://graph.facebook.com/v2.3/' + user_id + "?access_token=" + access_token)
            .on('complete', function(data){
                if(data.likes) {
                    cb(data.likes);
                } else {
                    cb();
                }
    });
};

facebook.getTalkingAboutFromUserId = function(user_id, cb){
    // Return all Facebook Page public data from a given user_id.

    rest.get('https://graph.facebook.com/v2.3/' + user_id + "?access_token=" + access_token)
            .on('complete', function(data){
                cb(data.talking_about_count);
    });
};



module.exports = facebook;
