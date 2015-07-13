var rest = require('restler');
var request = require('request')
var cheerio = require('cheerio')
var _ = require('lodash');
var winston = require('winston');
var instagram = {};
var settings = require("../config/settings")

instagram.client_id = '4f80570e54334d92b5a52bf76c64a962';
instagram.access_token = settings.auth_tokens.instagram


instagram.getFollowersByUserId = function(user_id, cb) {
    // Return follower count of a user given their id.

    winston.debug(user_id)

    instagram.getAccessToken(function(token) {
        if(token) {
            rest.get('https://api.instagram.com/v1/users/' + user_id + '/?access_token=' + token)
                .on('complete', function(data){
                    winston.debug("FollowerByID: " + user_id)
                    if(data.data) {
                        cb(data.data.counts.followed_by);
                    } else {
                        cb()
                    }
            });
        } else {
            cb()
        }
        
    })

    
};

instagram.getIdFromName = function(name, cb){
    // Return id of a user given their name.

    instagram.getAccessToken(function(token) {
        if(token) {
            rest.get('https://api.instagram.com/v1/users/search?q=' + name + '&access_token=' + instagram.access_token)
                .on('complete', function(data) {
                    // winston.log("getIdFromName: " + name, data)
                    if(data.data.length == 0) {
                        cb()
                    } else {
                        cb(data.data[0].id);
                    }

            });
        } else {
            cb()
        }
        

    })
    
    
};

instagram.getAccessToken = function(cb) {
    var authRoot = "https://instagram.com/oauth/authorize/?client_id=" + instagram.client_id
    rest.get("https://api.instagram.com/v1/users/search?q=setmine&access_token=" + instagram.access_token)
        .on('complete', function(data){
            if(data.meta.code == "400") {
                cb()
                // request(authRoot + "&redirect_uri=http://setstory.io&response_type=code", function(err, response, html) {
                //     var $ = cheerio.load(html)
                //     var mtoken = $($("input")[0]).attr("value")
                //     winston.log(mtoken)
                //     var postURL = authRoot + "&redirect_uri=http://setstory.io&response_type=code"
                //     winston.log(postURL)

                //     var postData = {
                //         csrfmiddlewaretoken: mtoken
                //     }

                //     var options = {
                //         method: 'post',
                //         body: postData,
                //         json: true,
                //         url: postURL
                //     }

                //     request(options, function(err, res, html) {
                //         winston.log(res)
                //         cb(res);
                //     })
                // })
            } else {
                cb(instagram.access_token)
            }
    });
    // rest.get("https://instagram.com/oauth/authorize/?client_id=" + instagram.client_id + "&redirect_uri=http://setstory.io&response_type=token")
    //     .on('complete', function(data){
    //         winston.log(data)
    //         cb(data);
    // });

} 


module.exports = instagram;
