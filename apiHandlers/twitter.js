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


module.exports = twitter;
