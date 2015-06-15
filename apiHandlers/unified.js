var setlistfm = require('./setlistfm');
var openaura = require('./openaura');
var setmine = require('./setmine');

var moment = require('moment');
var async = require('async')

var _ = require('lodash');

var unified = {};

unified.story = function(artist, supercallback){
    console.log("unified.story")
    async.parallel([
        function(callback) {
            setlistfmStory(artist, function(data) {
                console.log(data)
                callback(null, data)
            })
        }
    ], function(err, results) {
        supercallback(results[0])
    })

    function setlistfmStory(artist, callback) {
        setlistfm.getArtistGigs(artist, function(data){
            callback(data);
        })
    }

    function setmineStory(artist) {
        
    }

    function socialmediaStory(artist) {
        // setmine.socialmedia.
    }

    function openauraStory(artist) {
        
    }

}

module.exports = unified;
