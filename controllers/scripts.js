// Handles relations w/ mysql table artist_social_media in schema setstory
var settings = require('../config/settings');
var mysql = require('mysql');
var connection = mysql.createPool(settings.db.setstory);

var scripts = {};

scripts.startTimedSocialMedia = function(cb) {
	console.log("Starting timed social media script...")
	
	cb();
}

module.exports = scripts;