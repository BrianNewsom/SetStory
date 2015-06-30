var rest = require('restler');
var _ = require('lodash');
var winston = require('winston');
var facebook = {};
var access_token = "CAAW2O0iETykBAPC0hxpMu1vvB49GCZCHyJ3DY3mpLiamR8YOK7eJmVMuvkdYOS5YCViWRjxdcJMB8YmXRQZB0FCJbv0oqEhO5AfrbCvZADF1EDjuw6ukrZCVAsdE5VXfMprt6ZB9JSIyxsrZCSUHrYnqZBig8ttWrsrV7ZADetGZCWWj3n3q9nxeFh1K45rLiROkZD"


facebook.getUser = function(user_id, cb){
    // Return all Facebook Page public data from a given user_id.

    rest.get('https://graph.facebook.com/v2.3/' + user_id + "?access_token=" + access_token)
            .on('complete', function(data){
                cb(data);
    });
};

facebook.getLikesFromUserId = function(user_id, cb){
    winston.debug(user_id)

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
