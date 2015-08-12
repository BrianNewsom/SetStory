var request = require('request');
var _ = require('lodash');
var winston = require('winston');
var cheerio = require('cheerio');
var twitter = {};

twitter.getTwitterFollowers = function(twitterlink, callback) {
    request(twitterlink, function(err, resp, body) {
        if (err) {
            winston.error(err);
            callback()
        } else {
            var $ = cheerio.load(body);
            var twitterFollowersString = $(".ProfileNav-item--followers a.ProfileNav-stat").attr("title");
            callback(twitterFollowersString)
        }
    })
}

//change the code above to search thru 'artists' table in db and findWhere
//twitter_link IS NULL ; then search ECHONEST for correct links

//get twitter image links -> download images -> upload images to s3
//use that new image_id generated and set to specific artist
twitter.getTwitterImageLinks = function(twitterlink, callback) {
    request(twitterlink, function(err, resp, body) {
        if (err) {
            winston.error(err);
            callback()
        } else {
            var $ = cheerio.load(body);
            var twitterImageLink = $(".ProfileAvatar-image").attr("src");
            callback(twitterImageLink)
        }
    })
}


module.exports = twitter;
